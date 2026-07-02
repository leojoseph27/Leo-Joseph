"use client";

/**
 * NeuralNetworkLoader
 * ===================
 *
 * A premium, full-screen AI-initialization loading experience.
 *
 * Visual: a pure-black canvas with organically-scattered glowing nodes
 * (white / light grey) that slowly come alive as the progress climbs
 * 0% -> 100%. Thin animated lines connect the nodes, and light pulses
 * travel along the connections to simulate data flowing through an
 * artificial neural network.
 *
 * Palette: strictly monochrome — black background, grey mid-tones,
 * white highlights. No blue/cyan. This gives a high-end, minimal,
 * "premium tech" feel.
 *
 * A centered glassmorphism panel shows:
 *   "Analyzing Portfolio..."  +  a live percentage
 *
 * At 100% the percentage fades, the text becomes "Welcome.", the network
 * glows brightly, then everything dissolves into particles and fades out,
 * revealing the homepage beneath.
 *
 * Total duration ~2.4s, then onDone is called and the component unmounts.
 *
 * NOTE: This component is client-only. It must be mounted AFTER hydration
 * (see BootSequence) to avoid SSR hydration mismatches — it uses a canvas
 * and requestAnimationFrame which only exist in the browser.
 */

import { useEffect, useRef, useState } from "react";

type Node = {
  x: number;
  y: number;
  baseRadius: number;
  // phase for gentle pulsing
  phase: number;
  // 0..1 — how "active" this node is (driven by progress)
  activation: number;
};

type Pulse = {
  // index of the "from" node
  from: number;
  // index of the "to" node
  to: number;
  // 0..1 position along the edge
  t: number;
  // travel speed
  speed: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

const TOTAL_NODES = 64;
const CONNECT_DIST = 190;

// Stage thresholds (match the spec's 5 stages)
const STAGE_2 = 17;
const STAGE_3 = 43;
const STAGE_4 = 71;
const STAGE_5 = 100;

// Timing (ms)
const PROGRESS_DURATION = 1800; // 0% -> 100%
const WELCOME_HOLD = 650; // hold "Welcome." + glow
const FADE_OUT = 650; // dissolve + fade

export function NeuralNetworkLoader({ onDone }: { onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"analyzing" | "welcome" | "done">(
    "analyzing"
  );
  const [fade, setFade] = useState(false);
  const rafRef = useRef<number | null>(null);

  // mutable refs for the animation loop (avoid re-creating it on each render)
  const nodesRef = useRef<Node[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef(0);
  const phaseRef = useRef<"analyzing" | "welcome" | "done">("analyzing");
  const startRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---- init nodes (organic scatter, not a grid) ----
  const initNodes = (w: number, h: number) => {
    const nodes: Node[] = [];
    // Poisson-ish scattering: try random points, keep if far enough from
    // already-placed nodes. Produces an organic, non-grid layout.
    const minDist = Math.min(w, h) / 9;
    let attempts = 0;
    while (nodes.length < TOTAL_NODES && attempts < 4000) {
      attempts++;
      const x = Math.random() * (w - 40) + 20;
      const y = Math.random() * (h - 40) + 20;
      let ok = true;
      for (const n of nodes) {
        const dx = n.x - x;
        const dy = n.y - y;
        if (dx * dx + dy * dy < minDist * minDist) {
          ok = false;
          break;
        }
      }
      if (ok) {
        nodes.push({
          x,
          y,
          baseRadius: 1.4 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          activation: 0,
        });
      }
    }
    nodesRef.current = nodes;
  };

  // ---- main animation loop ----
  const draw = (ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const { w, h } = sizeRef.current;
    if (!startRef.current) startRef.current = ts;
    const elapsed = ts - startRef.current;

    // ---- update progress + phase ----
    let p = 0;
    if (elapsed < PROGRESS_DURATION) {
      // easeInOutCubic-ish for smooth, accelerating-then-settling feel
      const t = elapsed / PROGRESS_DURATION;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      p = Math.min(100, Math.round(eased * 100));
    } else {
      p = 100;
    }

    if (phaseRef.current === "analyzing") {
      setProgress(p);
      progressRef.current = p;
      if (p >= 100) {
        setPhase("welcome");
        phaseRef.current = "welcome";
        startRef.current = ts; // reset timer for the welcome hold
      }
    } else if (phaseRef.current === "welcome") {
      // hold welcome, then start fading
      if (elapsed > WELCOME_HOLD) {
        setFade(true);
        phaseRef.current = "done";
        startRef.current = ts;
      }
    } else if (phaseRef.current === "done") {
      if (elapsed > FADE_OUT) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onDone?.();
        return;
      }
    }

    const prog = progressRef.current;

    // ---- background: pure black with a subtle grey radial lift ----
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      0,
      w / 2,
      h / 2,
      Math.max(w, h) / 1.1
    );
    bg.addColorStop(0, "#0a0a0a");
    bg.addColorStop(0.55, "#050505");
    bg.addColorStop(1, "#000000");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // faint center glow (white) that intensifies with progress
    const glowAlpha = 0.03 + (prog / 100) * 0.1;
    const cg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      0,
      w / 2,
      h / 2,
      Math.max(w, h) / 2.5
    );
    cg.addColorStop(0, `rgba(255,255,255,${glowAlpha})`);
    cg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, w, h);

    // ---- update node activations based on stage ----
    const nodes = nodesRef.current;
    const stageActivation = (() => {
      // map progress to an overall "network awake" factor 0..1
      if (prog < STAGE_2) return 0.12 + (prog / STAGE_2) * 0.18; // a few nodes
      if (prog < STAGE_3)
        return 0.3 + ((prog - STAGE_2) / (STAGE_3 - STAGE_2)) * 0.25;
      if (prog < STAGE_4)
        return 0.55 + ((prog - STAGE_3) / (STAGE_4 - STAGE_3)) * 0.25;
      return 0.8 + ((prog - STAGE_4) / (STAGE_5 - STAGE_4)) * 0.2;
    })();

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      // each node has its own threshold so they wake up organically
      const wakeThreshold = (i / nodes.length) * 0.9;
      const target =
        stageActivation > wakeThreshold
          ? Math.min(1, (stageActivation - wakeThreshold) / 0.3)
          : 0;
      n.activation += (target - n.activation) * 0.08;
      n.phase += 0.02;
    }

    // ---- draw connections (white -> grey gradients) ----
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < CONNECT_DIST * CONNECT_DIST) {
          const dist = Math.sqrt(dist2);
          const connStrength =
            Math.min(a.activation, b.activation) *
            (1 - dist / CONNECT_DIST);
          if (connStrength > 0.02) {
            const alpha = connStrength * 0.5;
            // gradient line white -> grey for a premium monochrome edge
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
            grad.addColorStop(1, `rgba(160,160,160,${alpha})`);
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // ---- spawn pulses along active connections ----
    if (phaseRef.current !== "done" && Math.random() < 0.4 && prog > 2) {
      // pick a random active node pair
      const activeIdx = nodes
        .map((n, i) => (n.activation > 0.4 ? i : -1))
        .filter((i) => i >= 0);
      if (activeIdx.length > 1) {
        const fromIdx = activeIdx[(Math.random() * activeIdx.length) | 0];
        // find a nearby active partner
        const from = nodes[fromIdx];
        let best = -1;
        let bestD = CONNECT_DIST;
        for (const j of activeIdx) {
          if (j === fromIdx) continue;
          const dx = nodes[j].x - from.x;
          const dy = nodes[j].y - from.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestD && Math.random() < 0.3) {
            bestD = d;
            best = j;
          }
        }
        if (best >= 0) {
          pulsesRef.current.push({
            from: fromIdx,
            to: best,
            t: 0,
            speed: 0.008 + Math.random() * 0.012,
          });
        }
      }
    }

    // ---- update + draw pulses (bright white) ----
    const pulses = pulsesRef.current;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.t += pulse.speed;
      if (pulse.t >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const a = nodes[pulse.from];
      const b = nodes[pulse.to];
      if (!a || !b) {
        pulses.splice(i, 1);
        continue;
      }
      const px = a.x + (b.x - a.x) * pulse.t;
      const py = a.y + (b.y - a.y) * pulse.t;
      // brighten the receiving node when the pulse arrives
      b.activation = Math.min(1, b.activation + 0.02);

      // glowing white dot travelling along the edge
      const r = 2.2;
      const pg = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
      pg.addColorStop(0, "rgba(255,255,255,0.9)");
      pg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, r * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(px, py, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- draw nodes (white core, grey glow; brighter when active) ----
    for (const n of nodes) {
      const pulse = 0.6 + 0.4 * Math.sin(n.phase);
      const r = n.baseRadius * (1 + n.activation * 1.6) * (0.8 + pulse * 0.2);
      const alpha = 0.15 + n.activation * 0.85;
      // outer glow — grey for dim nodes, white for active ones
      const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
      const glowColor = n.activation > 0.6 ? "255,255,255" : "180,180,180";
      ng.addColorStop(0, `rgba(${glowColor},${alpha})`);
      ng.addColorStop(1, `rgba(${glowColor},0)`);
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
      ctx.fill();
      // core — pure white
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- "done" phase: dissolve nodes into particles ----
    if (phaseRef.current === "done") {
      const particles = particlesRef.current;
      // seed particles once from active nodes
      if (particles.length === 0) {
        for (const n of nodes) {
          if (n.activation > 0.2) {
            const count = 2 + ((Math.random() * 3) | 0);
            for (let k = 0; k < count; k++) {
              particles.push({
                x: n.x,
                y: n.y,
                vx: (Math.random() - 0.5) * 1.6,
                vy: (Math.random() - 0.5) * 1.6 - 0.3,
                life: 0,
                maxLife: 60 + Math.random() * 40,
                size: 1 + Math.random() * 2,
              });
            }
          }
        }
      }
      // update + draw particles, fade the network
      const fadeP = Math.min(1, elapsed / FADE_OUT);
      // draw a black veil that gradually hides the network
      ctx.fillStyle = `rgba(0,0,0,${fadeP * 0.92})`;
      ctx.fillRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life++;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.01;
        if (pt.life >= pt.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const a = 1 - pt.life / pt.maxLife;
        // particles fade white -> grey as they die
        const grey = Math.round(120 + 135 * a);
        ctx.fillStyle = `rgba(${grey},${grey},${grey},${a * 0.85})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  };

  // ---- setup + resize ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h, dpr };
      initNodes(w, h);
      pulsesRef.current = [];
      particlesRef.current = [];
    };

    resize();
    window.addEventListener("resize", resize);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPercent = phase === "analyzing";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700"
      style={{
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? "none" : "auto",
        background: "#000000",
      }}
      aria-hidden={fade}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* glassmorphism center panel — monochrome */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-12 py-9 rounded-2xl text-center"
        style={{
          background: "rgba(12,12,12,0.55)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 8px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
          minWidth: "min(380px, 82vw)",
        }}
      >
        {/* status text */}
        <div
          className="text-white font-light tracking-[0.22em] uppercase transition-all duration-500"
          style={{
            fontSize: "1.02rem",
            textShadow: "0 0 18px rgba(255,255,255,0.35)",
          }}
        >
          {phase === "welcome" ? (
            <span
              style={{
                fontSize: "1.85rem",
                letterSpacing: "0.14em",
                animation: "leoWelcomeIn 0.6s ease forwards",
              }}
            >
              Welcome.
            </span>
          ) : (
            <span style={{ animation: "leoFadePulse 2.2s ease-in-out infinite" }}>
              Analyzing Portfolio
              <span className="leo-loader-dots" />
            </span>
          )}
        </div>

        {/* percentage */}
        <div
          className="mt-5 transition-opacity duration-500"
          style={{
            opacity: showPercent ? 1 : 0,
            height: showPercent ? "auto" : 0,
            overflow: "hidden",
          }}
        >
          <div
            className="font-mono font-semibold tabular-nums"
            style={{
              fontSize: "2.5rem",
              color: "#ffffff",
              textShadow: "0 0 22px rgba(255,255,255,0.45)",
            }}
          >
            {progress}
            <span style={{ fontSize: "1.4rem", opacity: 0.55, marginLeft: 2 }}>
              %
            </span>
          </div>

          {/* slim progress track — white on grey */}
          <div
            className="mt-4 mx-auto overflow-hidden rounded-full"
            style={{
              width: "230px",
              height: "2px",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #888888, #ffffff, #cccccc)",
                boxShadow: "0 0 10px rgba(255,255,255,0.7)",
              }}
            />
          </div>
        </div>
      </div>

      <style
        // dangerouslySetInnerHTML avoids React reconciling the CSS text
        // content, which would otherwise cause a hydration mismatch
        // (browsers normalize <style> text differently from the server).
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes leoFadePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes leoWelcomeIn {
          0% { opacity: 0; transform: scale(0.92); letter-spacing: 0.45em; filter: blur(6px); }
          100% { opacity: 1; transform: scale(1); letter-spacing: 0.14em; filter: blur(0); }
        }
        .leo-loader-dots::after {
          content: "...";
          display: inline-block;
          width: 1.5em;
          text-align: left;
          animation: leoDots 1.4s steps(4, end) infinite;
        }
        @keyframes leoDots {
          0% { content: ""; }
          25% { content: "."; }
          50% { content: ".."; }
          75%, 100% { content: "..."; }
        }
      `,
        }}
      />
    </div>
  );
}
