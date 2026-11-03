"""
app.py
======

Thin Flask wrapper around ``gemini_service``.

This is the ONLY HTTP entry point for Gemini. The Next.js application
calls ``POST /generate`` here; it never talks to Gemini directly.

Run locally:
    python app.py

The service listens on port 8000 and exposes:
    GET  /health   -> service availability
    POST /generate -> generate text from a prompt
"""

from __future__ import annotations

import logging
import os

# Configure logging BEFORE importing gemini_service so the service's
# module-level startup log ("Gemini service available" / "Gemini NOT
# available") is captured.
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from flask import Flask, jsonify, request
from flask_cors import CORS

import gemini_service
logger = logging.getLogger("gemini_app")

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

app = Flask(__name__)

# CORS is required because the Next.js frontend (port 3000 / 7860) and this
# Python service (port 8000) run on different origins. In production the
# Next.js server-side route calls this directly over localhost, so CORS only
# matters for direct browser requests during development.
CORS(app)

# The dedicated port for this mini service.
PORT = int(os.environ.get("GEMINI_SERVICE_PORT", "8000"))


@app.get("/health")
def health():
    """Report whether the Gemini service is available."""
    return jsonify(
        {
            "available": gemini_service.is_available(),
            "model": gemini_service.MODEL_NAME,
        }
    )


@app.post("/generate")
def generate():
    """Generate text from a prompt.

    Request JSON:
        {
            "prompt": "Hello",
            "system_instruction": "optional system prompt"
        }

    Response JSON:
        {
            "text": "..."           # the generated text, or null on failure
            "available": true/false # whether Gemini was available
        }

    This endpoint never returns a 5xx for Gemini failures; it returns
    ``text: null`` so the caller can show a graceful fallback.
    """
    body = request.get_json(silent=True) or {}

    prompt = body.get("prompt")
    system_instruction = body.get("system_instruction")
    history = body.get("history")

    if not prompt or not isinstance(prompt, str):
        return jsonify({"text": None, "available": gemini_service.is_available()}), 400

    # History (if provided) is a list of {"role": "user"|"assistant",
    # "text": "..."} turns; assistant turns map to Gemini "model" turns.
    safe_history = None
    if isinstance(history, list):
        safe_history = [
            {"role": t.get("role"), "text": t.get("text")}
            for t in history
            if isinstance(t, dict)
            and t.get("role") in ("user", "assistant")
            and isinstance(t.get("text"), str)
        ][:40]  # hard cap: never forward an unbounded history

    text = gemini_service.generate_text(
        prompt=prompt,
        system_instruction=system_instruction,
        history=safe_history,
    )

    return jsonify(
        {
            "text": text,
            "available": gemini_service.is_available(),
            # Why generation failed ("auth" | "quota" | "error"), or null.
            "error": gemini_service.last_error if text is None else None,
        }
    )


@app.errorhandler(404)
def not_found(_err):
    return jsonify({"error": "not found"}), 404


@app.errorhandler(500)
def internal_error(_err):
    return jsonify({"text": None, "available": False}), 500


if __name__ == "__main__":
    # Hot-reload is opt-in via FLASK_DEBUG=1. By default the service runs
    # without the reloader so it stays stable when launched in the background
    # (nohup / Docker / HuggingFace Spaces).
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    logger.info("Starting Gemini service on port %s (debug=%s)", PORT, debug)
    app.run(host="0.0.0.0", port=PORT, debug=debug, use_reloader=debug)
