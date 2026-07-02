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
MODEL_NAME: str = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

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


def generate_text(prompt: str, system_instruction: str | None = None) -> str | None:
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
    client = _get_gemini_client()
    if client is None:
        # API key missing or client could not be created.
        return None

    if not prompt or not isinstance(prompt, str):
        return None

    try:
        kwargs = {
            "model": MODEL_NAME,
            "contents": prompt,
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
        return None
    except genai_errors.ClientError as exc:
        # Covers client-side errors (bad request, auth, etc.).
        logger.error("Gemini client error: %s", exc)
        return None
    except Exception as exc:
        # Catch-all: never let exceptions propagate into Flask/FastAPI routes.
        logger.error("Unexpected Gemini failure: %s", exc)
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
