"""
gemini_service.py
=================

Single source of truth for ALL Gemini interactions in this project.

Architecture
------------
- Uses the official Google Gen AI Python SDK: ``from google import genai``
- API key is read ONLY from the ``GOOGLE_API_KEY`` environment variable.
- A lazy singleton client is created on first use and reused afterwards.
- Exposes one public function ``generate_text(prompt, system_instruction=None)``.
- Exposes ``is_available()`` to verify whether the service can be used.
- Never crashes the application: every failure returns ``None``.

No route, utility, helper, or controller may call Gemini directly.
Every AI request throughout the project must go through this module.
"""

from __future__ import annotations

import os
import logging

from google import genai
from google.genai import errors as genai_errors

logger = logging.getLogger("gemini_service")

# Kind of the most recent failure: "auth" | "quota" | "error" | None.
# Lets the HTTP layer report WHY generation failed without leaking the
# key or full exception details.
last_error: str | None = None

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# The API key is read ONLY from the environment variable. It is never
# hardcoded, never logged, never returned in responses, and never committed
# to Git. This works identically for local development, Docker, HuggingFace
# Spaces, and production servers.
GOOGLE_API_KEY: str | None = os.environ.get("GOOGLE_API_KEY")

# A single configurable model variable. Do not hardcode the model in
# multiple places.
MODEL_NAME: str = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")

# ---------------------------------------------------------------------------
# Lazy singleton client
# ---------------------------------------------------------------------------

# Client starts as None. It is created only on first use and reused
# afterwards. We never recreate the client per request and never create
# multiple clients unnecessarily.
_client = None


def _get_gemini_client():
    """Return the shared Gemini client, creating it on first use.

    The client is authenticated with an API key only:
        genai.Client(api_key=GOOGLE_API_KEY)

    No OAuth, service accounts, credentials JSON, Vertex AI authentication,
    ADC, or Google Cloud auth is used.
    """
    global _client

    if _client is not None:
        return _client

    if not GOOGLE_API_KEY:
        # Cannot create a client without a key.
        return None

    try:
        _client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as exc:  # pragma: no cover - defensive
        # Never let client creation crash the application.
        logger.error("Failed to create Gemini client: %s", exc)
        _client = None

    return _client


# ---------------------------------------------------------------------------
# Availability check
# ---------------------------------------------------------------------------


def is_available() -> bool:
    """Verify whether the service can be used.

    Returns True only when an API key is present and a client can be
    constructed. This does NOT perform a network call.
    """
    if not GOOGLE_API_KEY:
        return False
    return _get_gemini_client() is not None


# ---------------------------------------------------------------------------
# Central generation function
# ---------------------------------------------------------------------------


def generate_text(
    prompt: str,
    system_instruction: str | None = None,
    history: list | None = None,
) -> str | None:
    """Generate text from a prompt using Gemini.

    This is the single public entry point for every AI request in the
    project. All routes, APIs, utilities, and business logic must call
    this function instead of instantiating ``genai.Client(...)`` directly.

    Parameters
    ----------
    prompt:
        The user prompt to send to the model.
    system_instruction:
        Optional system instruction used to shape the model's behaviour.
    history:
        Optional list of earlier turns, ``[{"role": "user"|"assistant",
        "text": "..."}, ...]`` in chronological order. Sent as native
        multi-turn contents so the model has real conversation context.

    Returns
    -------
    str | None
        The generated text, or ``None`` if:
          - the API key is missing
          - Gemini is unavailable
          - the quota is exceeded
          - a timeout occurs
          - any SDK exception or network failure happens

        The service never raises exceptions into the calling layer.
    """
    global last_error
    last_error = None

    client = _get_gemini_client()
    if client is None:
        # API key missing or client could not be created.
        last_error = "auth"
        return None

    if not prompt or not isinstance(prompt, str):
        return None

    try:
        contents = prompt
        if history:
            turns = []
            for turn in history:
                role = "user" if turn.get("role") == "user" else "model"
                text = (turn.get("text") or "").strip()
                if text:
                    turns.append({"role": role, "parts": [{"text": text}]})
            # Gemini expects alternating turns; collapse consecutive
            # same-role turns and drop a leading model turn defensively.
            cleaned = []
            for t in turns:
                if cleaned and cleaned[-1]["role"] == t["role"]:
                    cleaned[-1]["parts"][0]["text"] += "\n" + t["parts"][0]["text"]
                else:
                    cleaned.append(t)
            if cleaned and cleaned[0]["role"] == "model":
                cleaned.pop(0)
            if cleaned:
                contents = cleaned + [{"role": "user", "parts": [{"text": prompt}]}]

        kwargs = {
            "model": MODEL_NAME,
            "contents": contents,
        }

        if system_instruction:
            kwargs["config"] = {
                "system_instruction": system_instruction,
            }

        response = client.models.generate_content(**kwargs)

        text = getattr(response, "text", None)
        if not text:
            # Some responses may not carry text (e.g. blocked content).
            return None

        return text

    except genai_errors.APIError as exc:
        # Covers quota exceeded, timeouts, SDK exceptions, network failures.
        logger.error("Gemini API error: %s", exc)
        msg = str(exc)
        if getattr(exc, "code", None) == 429 or "429" in msg:
            last_error = "quota"
        elif "api key not valid" in msg.lower() or "unauthorized" in msg.lower():
            last_error = "auth"
        else:
            last_error = "error"
        return None
    except genai_errors.ClientError as exc:
        # Covers client-side errors (bad request, auth, etc.).
        logger.error("Gemini client error: %s", exc)
        code = getattr(exc, "code", None)
        last_error = "auth" if code in (401, 403) or "API key" in str(exc) else "error"
        return None
    except Exception as exc:
        # Catch-all: never let exceptions propagate into Flask/FastAPI routes.
        logger.error("Unexpected Gemini failure: %s", exc)
        last_error = "error"
        return None


# ---------------------------------------------------------------------------
# Startup log
# ---------------------------------------------------------------------------

# At application startup log ONLY whether the service is available.
# Never log the API key, partial key, headers, or tokens.
if is_available():
    logger.info("Gemini service available")
else:
    logger.info("Gemini NOT available")
