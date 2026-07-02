"""
api/gemini.py
=============

Vercel Python serverless function — the ONLY HTTP entry point for Gemini on
Vercel. This is the Vercel equivalent of the Flask `gemini/app.py` used in
Docker / HuggingFace Spaces deployments.

It imports and calls the shared `gemini_service` module — the single source
of truth for all Gemini interactions. No Gemini logic lives here; this is
purely a thin HTTP adapter.

Routes
------
POST /api/gemini
    Body: {"prompt": "...", "system_instruction": "..."}
    Returns: {"text": "..." | null, "available": true | false}

GET /api/gemini
    Returns: {"available": true | false, "model": "gemini-2.5-flash"}

On Vercel this is automatically deployed as a Python serverless function
because it lives in the root `api/` directory with a `.py` extension.
"""

from __future__ import annotations

import json
import os
import sys

# Ensure the project root is on the path so `from gemini.gemini_service import ...`
# works inside the Vercel serverless function runtime.
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from gemini.gemini_service import generate_text, is_available, MODEL_NAME  # noqa: E402

# Vercel function config (Hobby tier supports up to 60s).
max_duration = 60


def _json_response(status_code: int, body: dict) -> dict:
    """Build a Vercel-style response dict."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body),
    }


def _read_body(request) -> dict:
    """Extract JSON body from the Vercel request object (handles multiple
    runtime formats robustly)."""
    try:
        # Vercel Python runtime: request.body may be bytes, str, or a callable
        raw = getattr(request, "body", None)
        if callable(raw):
            raw = raw()
        if isinstance(raw, (bytes, bytearray)):
            raw = raw.decode("utf-8")
        if not raw:
            return {}
        return json.loads(raw)
    except Exception:
        return {}


def GET(request):
    """Health / availability check."""
    return _json_response(
        200,
        {"available": is_available(), "model": MODEL_NAME},
    )


def POST(request):
    """Generate text from a prompt via the Gemini service."""
    body = _read_body(request)

    prompt = body.get("prompt")
    system_instruction = body.get("system_instruction")

    if not prompt or not isinstance(prompt, str):
        return _json_response(
            400, {"text": None, "available": is_available()}
        )

    # Every Gemini request goes through the single integration layer.
    text = generate_text(
        prompt=prompt,
        system_instruction=system_instruction,
    )

    return _json_response(
        200,
        {"text": text, "available": is_available()},
    )


def OPTIONS(request):
    """CORS preflight."""
    return _json_response(204, {})
