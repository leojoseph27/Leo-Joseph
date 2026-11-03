"use client";

import React, { useRef, useEffect } from "react";

/* WebGL glowing background – same as certification folder */
function ShaderCanvas({
  className,
  containerRef,
}: {
  className?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glProgramRef = useRef<WebGLProgram | null>(null);
  const glBgColorLocationRef = useRef<WebGLUniformLocation | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const backgroundColor = [0, 0, 0] as [number, number, number];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;
    glRef.current = gl;

    const vertexShaderSource = `attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff = center-uv;
        float len = length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        len -= variation(diff,vec2(1.,0.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 v=rotate2d(iTime)*uv;
        vec3 foregroundColor=vec3(v.x,v.y,.7-v.y*v.x);
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r);
        gl_FragColor=vec4(color,1.);
      }`;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation error");
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    glProgramRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, "iTime");
    const iResLoc = gl.getUniformLocation(program, "iResolution");
    glBgColorLocationRef.current = gl.getUniformLocation(program, "uBackgroundColor");
    gl.uniform3fv(glBgColorLocationRef.current, new Float32Array(backgroundColor));

    let animationFrameId: number;
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "100px" }
    );
    io.observe(container);

    const render = (time: number) => {
      if (visible) {
        gl.uniform1f(iTimeLoc, time * 0.001);
        gl.uniform2f(iResLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    const updateSize = () => {
      if (!container || !canvas) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
    };

    updateSize();
    animationFrameId = requestAnimationFrame(render);

    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ background: "rgb(0,0,0)" }}
    />
  );
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export interface CertificationCardProps {
  certificationName: string;
  issuer: string;
  description: string;
  skills: string[];
}

function CertificationCard({
  certificationName,
  description,
  skills,
}: CertificationCardProps) {
  return (
    <div
      className="md:backdrop-blur-[14px] bg-gradient-to-br rounded-xl shadow-lg w-full h-full min-h-0 px-5 py-5 flex flex-col transition-all duration-300 from-black/65 to-black/45 border border-white/15"
    >
      <div className="shrink-0 mb-3">
        <h2 className="text-xl md:text-2xl font-bold tracking-[-0.03em] text-white leading-tight">
          {certificationName}
        </h2>
        <p className="text-sm md:text-base text-white/70 mt-1.5 line-clamp-2">
          {description}
        </p>
      </div>
      <div
        className="w-full my-3 h-px shrink-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12)_20%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.12)_80%,transparent)]"
      />
      <ul className="flex flex-col gap-1.5 text-[15px] text-white/90 font-sans flex-1 min-h-0 overflow-auto">
        {skills.map((skill, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckIcon className="text-cyan-400 w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Same data as certification folder (Elora + additions)
const CERTIFICATIONS: CertificationCardProps[] = [
  {
    certificationName: "AWS",
    issuer: "Amazon Web Services",
    description: "Cloud essentials.",
    skills: ["Knowledge: Cloud Essentials - Training Badge"],
  },
  {
    certificationName: "Microsoft",
    issuer: "Microsoft",
    description: "Cloud, AI, and security fundamentals.",
    skills: [
      "Azure Fundamentals",
      "AI Fundamentals",
      "Security, Compliance & Identity Fundamentals",
    ],
  },
  {
    certificationName: "Cisco",
    issuer: "Cisco",
    description: "Networking, Python, and security essentials.",
    skills: [
      "Python Essentials",
      "Ethical Hacking",
      "Introduction to Packet Tracer",
    ],
  },
  {
    certificationName: "Google",
    issuer: "Google",
    description: "Specializations in cybersecurity, data, and project management.",
    skills: [
      "Cybersecurity Specialization",
      "Data Analytics Specialization",
      "Project Management Specialization",
    ],
  },
  {
    certificationName: "Meta",
    issuer: "Meta",
    description: "Mobile development credentials.",
    skills: ["Android Development"],
  },
  {
    certificationName: "IBM",
    issuer: "IBM",
    description: "Generative AI and enterprise-grade AI.",
    skills: [
      "Gen AI Foundational Models for NLP & Language Understanding",
      "GenAI for NLP – Language Understanding",
      "Getting Started with Enterprise-Grade AI",
      "Artificial Intelligence Fundamentals",
    ],
  },
];

export function CertificationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="certifications"
      ref={sectionRef}
      className="w-full shrink-0 relative overflow-hidden bg-black pt-16 md:pt-20 pb-8 md:pb-10 px-4 md:px-6 min-h-[100vh]"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <ShaderCanvas containerRef={sectionRef} className="block w-full h-full" />
      </div>
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <h1 className="section-title text-center mb-10 md:mb-12 pt-2 md:pt-0 md:-mt-[10vh]">
          My <span className="text-cyan-400">Certifications</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 min-h-[420px]">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert.certificationName} className="min-h-[200px]">
              <CertificationCard {...cert} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
