#!/usr/bin/env bash
# =============================================================================
# start.sh — launches both processes inside the HuggingFace Spaces container.
# =============================================================================
# 1. Python Gemini service (gunicorn, the single integration layer) on :8000
# 2. Next.js production server on :7860 (HuggingFace Spaces default port)
#
# GOOGLE_API_KEY is read from the environment at runtime — never from a file.
# =============================================================================
set -e

PORT="${PORT:-7860}"

echo "=== Starting Python Gemini service on :8000 ==="
# A single worker keeps the lazy-singleton Gemini client simple and avoids
# multiplying API client instances across processes.
gunicorn -w 1 -b 0.0.0.0:8000 --chdir gemini --access-logfile - app:app &
GEMINI_PID=$!

# Give the Python service a moment to boot before Next.js starts calling it.
sleep 2

echo "=== Starting Next.js on :${PORT} ==="
# `exec` so Next.js becomes PID 1 and receives SIGTERM cleanly.
exec npx next start -p "${PORT}"
