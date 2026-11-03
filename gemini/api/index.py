"""Vercel serverless entry point for the Gemini service.

Exposes the Flask app (gemini/app.py) as a WSGI serverless function so
the Python service can run on Vercel in addition to Docker/HuggingFace.
"""

import os
import sys

# Make gemini/app.py importable from this api/ subdirectory.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app  # noqa: E402,F401  (the WSGI callable Vercel runs)
