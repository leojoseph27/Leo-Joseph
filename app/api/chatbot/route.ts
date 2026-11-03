import { NextResponse } from "next/server";
import {
  CORE_FACTS,
  retrieveKnowledge,
} from "@/app/api/chatbot/knowledge";

/**
 * Chatbot API route.
 *
 * This route is the ONLY place in the Next.js application that talks to the
 * Gemini integration layer. It does NOT call any Gemini SDK directly. All
 * Gemini communication goes through the dedicated Python service module
 * (`gemini_service.py`) exposed at `GEMINI_SERVICE_URL`.
 *
 * Capabilities:
 *  - Per-session conversation memory (in-memory store keyed by a
 *    client-generated sessionId; sessions never mix and expire when idle).
 *  - Context management: the most recent turns are sent as native
 *    multi-turn history; anything older is compressed into a short
 *    conversation summary so context never grows unbounded.
 *  - Knowledge retrieval: each question pulls the most relevant facts
 *    from the knowledge base (website content + resume) into the system
 *    instruction.
 */

const GEMINI_SERVICE_URL =
  process.env.GEMINI_SERVICE_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Persona instructions
// ---------------------------------------------------------------------------

const PERSONA_PROMPT = `You are Leo — you represent Leo Joseph Perumpully, a Computer Science engineer and full-stack developer with an AI specialization. You speak as Leo, in the first person, like a real person having a friendly, natural conversation.

HOW TO CONVERSE:
- Use the full conversation history to understand the current question. References like "there", "that company", "your role", "the project", "this technology", "what about it" refer to things mentioned earlier — resolve them from context.
- Remember what the user has already told you in this chat. Never ask for information they already provided.
- Be warm, conversational and concise. Prefer 1-4 sentences unless the question genuinely needs more detail.
- It is fine to make reasonable contextual connections between known facts (e.g. linking a project to a skill it used).

HOW TO USE THE KNOWLEDGE BASE:
- The KNOWN FACTS section below is your trusted source of personal information (it comes from Leo's website and resume — dates, names, titles and terminology are accurate).
- Answer follow-up questions using BOTH the conversation context AND the known facts.
- When a question is only partially covered, answer with what IS known, share the relevant available details, and be honest about the limits in a natural way. For example: "I've been working at Al-Nassim Golden Group as a Full Stack Developer since March 2026 — I can tell you about what I build there, though I don't have much to share about the company's overall culture."
- NEVER invent or embellish: no fabricated company reviews, workplace culture, salaries, team details, projects, achievements, dates or personal opinions. If the reason/motivation behind a fact isn't in your knowledge, say so naturally instead of inventing a story.
- Do NOT say "this information is not available" as a robotic refusal — if you truly know nothing relevant, say so like a person would, and offer the closest thing you do know.

STYLE:
- Plain, friendly English. First person. No bullet-point dumps unless the user asks for a list.
- Do not repeat your introduction if you have already greeted the user in this conversation.
- Keep private details (passport number, exact home address) out of replies unless directly asked for contact purposes.`;

// ---------------------------------------------------------------------------
// Per-session conversation memory
// ---------------------------------------------------------------------------

interface Turn {
  role: "user" | "assistant";
  text: string;
}

interface Session {
  turns: Turn[];
  summary: string; // rolling summary of turns older than the window
  summarizedUpTo: number; // number of turns covered by the summary
  updatedAt: number;
}

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h idle expiry
const MAX_SESSIONS = 300;
const HISTORY_WINDOW = 12; // recent turns sent verbatim
const SUMMARY_TRIGGER = 4; // re-summarize after this many extra older turns

const sessions = new Map<string, Session>();

function getSession(id: string): Session {
  // Opportunistic cleanup so the store cannot grow without bound.
  if (sessions.size > MAX_SESSIONS) {
    const now = Date.now();
    for (const [k, s] of sessions) {
      if (now - s.updatedAt > SESSION_TTL_MS) sessions.delete(k);
    }
    while (sessions.size > MAX_SESSIONS) {
      const oldest = [...sessions.entries()].sort(
        (a, b) => a[1].updatedAt - b[1].updatedAt
      )[0];
      sessions.delete(oldest[0]);
    }
  }
  let s = sessions.get(id);
  if (!s || Date.now() - s.updatedAt > SESSION_TTL_MS) {
    s = { turns: [], summary: "", summarizedUpTo: 0, updatedAt: Date.now() };
    sessions.set(id, s);
  }
  return s;
}

async function callGeminiService(
  prompt: string,
  systemInstruction: string,
  history: Turn[] | null
): Promise<{
  ok: boolean;
  available: boolean;
  text: string | null;
  errorKind: string | null;
}> {
  const serviceRes = await fetch(`${GEMINI_SERVICE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      system_instruction: systemInstruction,
      ...(history && history.length ? { history } : {}),
    }),
    signal: AbortSignal.timeout(60_000),
  }).catch(() => null);

  if (!serviceRes || !serviceRes.ok) {
    return { ok: false, available: false, text: null, errorKind: null };
  }
  const data = await serviceRes.json().catch(() => ({}));
  const available = !!(data && data.available === true);
  const text =
    data && typeof data.text === "string" && data.text.trim()
      ? data.text.trim()
      : null;
  const errorKind =
    data && typeof data.error === "string" ? data.error : null;
  return { ok: true, available, text, errorKind };
}

/** Compress turns older than the history window into a short summary. */
async function maintainSummary(session: Session): Promise<void> {
  const olderCount = session.turns.length - HISTORY_WINDOW;
  if (olderCount - session.summarizedUpTo < SUMMARY_TRIGGER) return;

  const olderText = session.turns
    .slice(0, olderCount)
    .map((t) => `${t.role === "user" ? "User" : "Leo"}: ${t.text}`)
    .join("\n");

  const prompt = session.summary
    ? `Existing summary of the earlier conversation:\n${session.summary}\n\nNew messages to fold in:\n${olderText.slice(-4000)}\n\nRewrite the summary to cover everything in at most 120 words. Keep names, companies, dates and topics. Output only the summary.`
    : `Summarize this conversation in at most 120 words, keeping names, companies, dates and topics. Output only the summary.\n\n${olderText.slice(-4000)}`;

  const res = await callGeminiService(
    prompt,
    "You write concise, accurate conversation summaries.",
    null
  );
  // Even without a usable summary we stop re-trying until more turns
  // accumulate — the request itself never sends more than the window.
  session.summarizedUpTo = olderCount;
  if (res.text) session.summary = res.text;
}

// ---------------------------------------------------------------------------
// Route handler — Gemini is the ONLY AI provider. Failures surface as
// honest, specific errors; nothing silently substitutes another model.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userMessage = (body.message as string) || "";
    const rawSessionId = body.sessionId;
    const sessionId =
      typeof rawSessionId === "string" &&
      rawSessionId.length > 0 &&
      rawSessionId.length <= 64
        ? rawSessionId
        : "default";

    if (!userMessage.trim()) {
      return NextResponse.json({
        reply:
          "Hello! I'm Leo — the AI version of Leo Joseph. Feel free to ask me anything to learn more about me!",
      });
    }

    const session = getSession(sessionId);

    // --- Build context: recent turns + rolling summary ---------------------
    await maintainSummary(session);
    const history = session.turns.slice(-HISTORY_WINDOW);
    const contextForRetrieval = [
      ...history.slice(-3).map((t) => t.text),
      userMessage,
    ].join(" ");
    const facts = retrieveKnowledge(contextForRetrieval, 4);

    const systemInstruction = [
      PERSONA_PROMPT,
      session.summary
        ? `\nSUMMARY OF THIS CONVERSATION SO FAR:\n${session.summary}`
        : "",
      `\nKNOWN FACTS:\n- ${CORE_FACTS.text}`,
      ...facts.map((f) => `- ${f.text}`),
    ].join("\n");

    // --- Primary path: Gemini service --------------------------------------
    const gemini = await callGeminiService(
      userMessage,
      systemInstruction,
      history.length ? history : null
    );

    if (gemini.text) {
      session.turns.push(
        { role: "user", text: userMessage },
        { role: "assistant", text: gemini.text }
      );
      session.updatedAt = Date.now();
      return NextResponse.json({ reply: gemini.text });
    }

    // --- Gemini failure paths (no substitute provider, ever) ---------------
    // The failed turn is not recorded, so a retry starts clean.
    if (!gemini.ok) {
      // The Python service itself was unreachable.
      return NextResponse.json(
        {
          ok: false,
          error: "gemini_service_unreachable",
          reply:
            "Leo AI can't reach the Gemini service right now. " +
            "Please make sure the Python service is running (port 8000) and try again.",
        },
        { status: 200 }
      );
    }

    if (!gemini.available) {
      return NextResponse.json(
        {
          ok: false,
          error: "gemini_not_configured",
          reply:
            "Leo AI is not configured: the GOOGLE_API_KEY environment variable " +
            "is missing or invalid on the Gemini service.",
        },
        { status: 200 }
      );
    }

    // Service healthy but Gemini produced no text (invalid key, quota,
    // safety block, transient API error). Honest failure with the
    // specific cause, no fabricated answer, no substitute provider.
    const replies: Record<string, string> = {
      auth:
        "Gemini rejected the request: the GOOGLE_API_KEY is missing or " +
        "invalid. Please check the key on the Gemini service.",
      quota:
        "Gemini's quota for this API key is exhausted right now (free tier " +
        "has daily limits). Please try again later or upgrade the plan.",
    };
    return NextResponse.json(
      {
        ok: false,
        error: gemini.errorKind ? `gemini_${gemini.errorKind}` : "gemini_no_response",
        reply:
          (gemini.errorKind && replies[gemini.errorKind]) ||
          "Gemini didn't return a response just now. Please try again in a moment.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Chatbot API error:", err);
    return NextResponse.json({ reply: "Server error" }, { status: 500 });
  }
}
