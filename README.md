# Leo404 — AI Portfolio with Gemini Integration

A Next.js portfolio website with an AI chatbot powered by the **official Google Gen AI Python SDK** (`from google import genai`). Deployable on **Vercel** or **HuggingFace Spaces**.

## Architecture

```
Leo404/
├── app/                        # Next.js App Router (frontend + API routes)
│   ├── api/chatbot/route.ts    # Calls the Python Gemini layer over HTTP
│   └── ...
├── api/                        # Vercel serverless functions
│   └── gemini.py               # Vercel Python function → imports gemini_service
├── components/                 # React UI components (incl. neural-network loader)
├── public/                     # Static assets (CV, images)
├── lib/                        # Shared utilities
├── gemini/                     # 🧠 The SINGLE integration layer for Gemini
│   ├── gemini_service.py       # Lazy singleton client + generate_text()
│   ├── app.py                  # Flask wrapper (for Docker / HuggingFace)
│   └── requirements.txt        # Flask deps (Docker / HF only)
├── requirements.txt            # Root Python deps (Vercel: google-genai)
├── vercel.json                 # Vercel config (Next.js + Python function)
├── Dockerfile                  # HuggingFace Spaces (Node + Python)
├── start.sh                    # Launches both processes (Docker / HF)
├── .env.example                # Documents GOOGLE_API_KEY
└── package.json
```

### Gemini integration rules (enforced)

- **Official SDK only:** `from google import genai` (never the deprecated `google.generativeai`).
- **One integration layer:** `gemini/gemini_service.py` is the *only* file that talks to Gemini. No route, utility, or controller calls Gemini directly.
- **Lazy singleton client:** the `genai.Client` is created once on first use and reused.
- **API key from env only:** `GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")`. Never hardcoded, logged, or returned.
- **Graceful failures:** `generate_text()` returns `None` on any error (missing key, quota, timeout, network) — the app never crashes.
- **Single model variable:** `MODEL_NAME = "gemini-2.5-flash"`.

### How the chatbot route finds the Gemini layer

| Platform | `GEMINI_SERVICE_URL` | Endpoint called |
|---|---|---|
| **Vercel** | unset | `/api/gemini` (Vercel Python serverless function) |
| **HuggingFace / Docker** | `http://localhost:8000` | `${GEMINI_SERVICE_URL}/generate` (Flask) |
| **Local dev** | `http://localhost:8000` or unset | Flask service, or z-ai fallback |

---

## Deploy on Vercel (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
3. Vercel auto-detects Next.js. Add the environment variable:
   - **Name:** `GOOGLE_API_KEY`
   - **Value:** your Gemini API key (get one at https://aistudio.google.com/app/apikey)
4. Click **Deploy**. Vercel builds the Next.js app + the Python serverless function automatically.

That's it — no Docker, no separate service to manage. The `api/gemini.py` Python function runs as a Vercel serverless function and imports the shared `gemini_service.py` module.

---

## Deploy on HuggingFace Spaces (Docker)

1. Create a new **Docker** Space on HuggingFace.
2. Push this repository to the Space's Git repo.
3. Under **Settings → Secrets**, add `GOOGLE_API_KEY` = your Gemini API key.
4. The Space builds automatically and serves on port `7860`.

---

## Local development

```bash
# 1. Install Node dependencies
npm install

# 2. Install Python dependencies
pip install -r gemini/requirements.txt

# 3. Set your API key (never commit this file)
cp .env.example .env
#   then edit .env and set GOOGLE_API_KEY=...

# 4. Start the Python Gemini service (port 8000)
cd gemini && python app.py &
cd ..

# 5. Set GEMINI_SERVICE_URL so the Next.js route finds the Flask service
export GEMINI_SERVICE_URL=http://localhost:8000

# 6. Start the Next.js dev server (port 3000)
npm run dev
```

Open <http://localhost:3000>.

> **Note:** If you don't run the Flask service, the chatbot falls back to the `z-ai-web-dev-sdk` (server-side) so you can still test locally. On Vercel/HF, once `GOOGLE_API_KEY` is set, the real Gemini service takes over.

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_API_KEY` | yes | — | Google Gemini API key (env only) |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | Model name |
| `GEMINI_SERVICE_URL` | no | unset | Flask service URL (Docker/HF only; unset on Vercel) |
| `GEMINI_SERVICE_PORT` | no | `8000` | Flask service port (Docker/HF only) |
| `PORT` | no | `7860` | Next.js port (HuggingFace Docker default) |
