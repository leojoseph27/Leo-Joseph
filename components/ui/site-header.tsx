"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#certifications", label: "Certifications" },
  { href: "#publications", label: "Publications" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Close the menu if the viewport grows into the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Publications is desktop/tablet only — the mobile menu skips it and
  // jumps from Certifications to Projects.
  const MOBILE_LINKS = NAV_LINKS.filter(
    (link) => link.href !== "#publications"
  );

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <a
          href="#home"
          className="text-[0.85rem] md:text-[1.05rem] font-semibold tracking-[0.35em] text-white uppercase whitespace-nowrap"
        >
          Leo Joseph
        </a>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-5 lg:gap-7 text-[0.95rem] lg:text-[1rem] text-neutral-300 capitalize"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-md text-neutral-200 hover:bg-white/10 transition-colors"
        >
          <span className="sr-only">Menu</span>
          <span
            aria-hidden
            className={`block h-0.5 w-6 bg-current transition-transform duration-300 ${
              open ? "rotate-45 translate-y-[7px]" : "-translate-y-2"
            }`}
          />
          <span
            aria-hidden
            className={`absolute h-0.5 w-6 bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            aria-hidden
            className={`block h-0.5 w-6 bg-current transition-transform duration-300 ${
              open ? "-rotate-45 -translate-y-[7px]" : "translate-y-2"
            }`}
          />
        </button>
      </div>
      </header>

      {/* Mobile dropdown — a SIBLING of the header (the header's
          backdrop-filter would otherwise break fixed positioning) with a
          CONTENT-based height: it starts under the header and ends just
          below the last link, leaving the page visible beneath it. */}
      <div
        id="mobile-nav"
        className={`md:hidden fixed inset-x-0 top-[57px] z-40 bg-black shadow-2xl transition-all duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Primary mobile"
          className="flex flex-col gap-1 px-6 pt-5 pb-5 text-neutral-200"
        >
          {MOBILE_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
              className={`py-3.5 text-2xl font-medium capitalize border-b border-white/10 transition-all duration-300 ${
                open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
