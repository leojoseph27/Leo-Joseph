"use client";

import React from "react";

const WEB3FORMS_ACTION = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "902e4344-c52b-4fe2-a204-01dc51c1036b";

export const Contact2: React.FC = () => {
  const [status, setStatus] = React.useState<"idle" | "sending" | "success" | "error">("idle");
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form || status === "sending") return;

    setStatus("sending");
    try {
      const response = await fetch(WEB3FORMS_ACTION, {
        method: "POST",
        body: new FormData(form),
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 1500);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <section className="w-full py-16 md:py-20">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-stretch">
          {/* Left: heading beside form top, contact details beside form bottom */}
          <div className="flex flex-col justify-between">
            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-3xl md:text-4xl font-semibold text-white">
                Contact <span className="text-purple-400">Me</span>
              </h3>
              <p className="text-neutral-300 text-sm md:text-base max-w-md mx-auto lg:mx-0">
                Feel free to reach out for collaborations, opportunities, or any inquiries.
              </p>
            </div>

            <div className="mt-8 lg:mt-0 space-y-5 text-sm md:text-base text-neutral-200">
              <div>
                <h4 className="text-neutral-400 uppercase tracking-wide text-xs mb-1.5">
                  Phone
                </h4>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <span>+965 66235398</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <span>+965 99663890</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-neutral-400 uppercase tracking-wide text-xs mb-1.5">
                  Email
                </h4>
                <a
                  href="mailto:leojoseph975@gmail.com"
                  className="text-purple-300 hover:text-purple-200 underline-offset-4 hover:underline break-all"
                >
                  leojoseph975@gmail.com
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="text-neutral-400 uppercase tracking-wide text-xs mb-1.5">
                    LinkedIn
                  </h4>
                  <a
                    href="https://www.linkedin.com/in/leo-joseph-351aba232/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 underline-offset-4 hover:underline break-all"
                  >
                    linkedin.com/in/leo-joseph
                  </a>
                </div>
                <div>
                  <h4 className="text-neutral-400 uppercase tracking-wide text-xs mb-1.5">
                    GitHub
                  </h4>
                  <a
                    href="https://github.com/leojoseph27"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 underline-offset-4 hover:underline break-all"
                  >
                    github.com/leojoseph27
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: contact form – same as Elora (Web3Forms) */}
          <div className="rounded-2xl border border-white/10 bg-black/60 md:backdrop-blur-md p-6 md:p-8 space-y-5">
            <form
              ref={formRef}
              action={WEB3FORMS_ACTION}
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <input
                type="hidden"
                name="access_key"
                value={WEB3FORMS_ACCESS_KEY}
              />
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-medium text-neutral-300 uppercase tracking-wide"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="name"
                  required
                  className="h-10 w-full rounded-md border border-white/15 bg-black/60 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-medium text-neutral-300 uppercase tracking-wide"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="email"
                  required
                  className="h-10 w-full rounded-md border border-white/15 bg-black/60 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-neutral-300 uppercase tracking-wide"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="subject"
                  className="h-10 w-full rounded-md border border-white/15 bg-black/60 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-neutral-300 uppercase tracking-wide"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  placeholder="message"
                  required
                  className="w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-70 disabled:pointer-events-none"
              >
                {status === "sending" ? "Please wait..." : "send message"}
              </button>

              <div
                className={`text-sm transition-all duration-300 ${
                  status === "success"
                    ? "text-green-400 opacity-100"
                    : status === "error"
                      ? "text-red-400 opacity-100"
                      : "opacity-0 h-0 overflow-hidden"
                }`}
              >
                {status === "success" && "Sent successfully"}
                {status === "error" && "Something went wrong. Please try again."}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

