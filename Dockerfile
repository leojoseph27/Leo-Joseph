# =============================================================================
# HuggingFace Spaces — Leo404 Portfolio with Gemini Integration
# =============================================================================
# A single Docker container runs two processes:
#   1. Python Gemini service (the ONLY integration layer for Gemini)  -> :8000
#   2. Next.js frontend + API routes                                   -> :7860
#
# The Next.js chatbot API route calls the Python service over localhost.
# No Gemini SDK is ever used in the Node/JavaScript side.
#
# The GOOGLE_API_KEY is injected at runtime by HuggingFace Spaces Secrets
# (or any production environment). It is NEVER baked into this image.
# =============================================================================

FROM node:20-slim

# ---- System: Python 3 + venv (no build secrets, no API keys here) ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Isolated virtual environment (avoids PEP 668 externally-managed errors)
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# ---- Python dependencies (cached independently of Node code) ----
COPY gemini/requirements.txt ./gemini/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r gemini/requirements.txt

# ---- Node dependencies ----
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# ---- Application code ----
COPY . .

# ---- Build Next.js for production ----
RUN npm run build

# ---- Runtime configuration ----
# The Python service lives at localhost:8000 inside the container.
ENV GEMINI_SERVICE_URL=http://localhost:8000
# HuggingFace Spaces expects the app on port 7860.
ENV PORT=7860

EXPOSE 7860

# Start both the Python Gemini service and the Next.js server.
CMD ["bash", "start.sh"]
