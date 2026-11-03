"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ProjectReadMoreSection = {
  title: string;
  items: string[];
};

export type FocusRailItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc: string;
  href?: string;
  meta?: string;
  readMoreContent?: ProjectReadMoreSection[];
};

interface FocusRailProps {
  items: FocusRailItem[];
  initialIndex?: number;
  loop?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

const BASE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

const TAP_SPRING = {
  type: "spring",
  stiffness: 450,
  damping: 18,
  mass: 1,
};

export function FocusRail({
  items,
  initialIndex = 0,
  loop = true,
  autoPlay = false,
  interval = 4000,
  className,
}: FocusRailProps) {
  const [active, setActive] = React.useState(initialIndex);
  const [isHovering, setIsHovering] = React.useState(false);
  const [readMoreItem, setReadMoreItem] = React.useState<FocusRailItem | null>(null);
  const lastWheelTime = React.useRef<number>(0);
  const isMobile = useIsMobile();

  const count = items.length;
  const activeIndex = wrap(0, count, active);
  const activeItem = items[activeIndex];

  // Carousel geometry scales down on phones so neighbour cards peek
  // instead of flying off-screen.
  const visibleOffsets = isMobile ? [-1, 0, 1] : [-2, -1, 0, 1, 2];
  const xStep = isMobile ? 96 : 320;
  const zStep = isMobile ? 90 : 180;
  const cardWidth = isMobile ? 200 : 300;
  const stageHeight = isMobile ? 300 : 360;

  const handlePrev = React.useCallback(() => {
    if (!loop && active === 0) return;
    setActive((p) => p - 1);
  }, [loop, active]);

  const handleNext = React.useCallback(() => {
    if (!loop && active === count - 1) return;
    setActive((p) => p + 1);
  }, [loop, active, count]);

  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 400) return;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 20) {
        if (delta > 0) handleNext();
        else handlePrev();
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev]
  );

  React.useEffect(() => {
    if (!autoPlay || isHovering) return;
    const timer = setInterval(() => handleNext(), interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, handleNext, interval]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const onDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) handleNext();
    else if (swipe > swipeConfidenceThreshold) handlePrev();
  };

  return (
    <div
      className={cn(
        "group relative flex h-[540px] md:h-[600px] w-full flex-col overflow-hidden bg-black text-white outline-none select-none overflow-x-hidden",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeItem.imageSrc}
              alt=""
              fill
              sizes="100vw"
              className="object-cover blur-3xl saturate-200"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 md:px-8">
        <motion.div
          className="relative mx-auto flex w-full max-w-6xl items-center justify-center perspective-[1200px] cursor-grab active:cursor-grabbing"
          style={{ height: stageHeight }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {visibleOffsets.map((offset) => {
            const absIndex = active + offset;
            const index = wrap(0, count, absIndex);
            const item = items[index];

            if (!loop && (absIndex < 0 || absIndex >= count)) return null;

            const isCenter = offset === 0;
            const dist = Math.abs(offset);

            const xOffset = offset * xStep;
            const zOffset = -dist * zStep;
            const scale = isCenter ? 1 : isMobile ? 0.8 : 0.85;
            const rotateY = offset * (isMobile ? -26 : -20);
            const opacity = isCenter ? 1 : Math.max(0.1, 1 - dist * 0.5);
            const blur = isCenter ? 0 : dist * (isMobile ? 4 : 6);
            const brightness = isCenter ? 1 : 0.5;

            return (
              <motion.div
                key={absIndex}
                className={cn(
                  "absolute aspect-[3/4] rounded-2xl border border-white/10 bg-black/60 shadow-2xl transition-shadow duration-300 backdrop-blur-sm",
                  isCenter ? "z-20 shadow-white/5" : "z-10"
                )}
                style={{
                  width: cardWidth,
                  transformStyle: "preserve-3d",
                }}
                initial={false}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  scale: scale,
                  rotateY: rotateY,
                  opacity: opacity,
                  filter: `blur(${blur}px) brightness(${brightness})`,
                }}
                transition={(val: string) => {
                  if (val === "scale") return TAP_SPRING;
                  return BASE_SPRING;
                }}
                onClick={() => {
                  if (offset !== 0) setActive((p) => p + offset);
                }}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  sizes={`${cardWidth}px`}
                  className="rounded-2xl object-cover pointer-events-none"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl bg-black/10 pointer-events-none mix-blend-multiply" />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mx-auto mt-8 md:mt-12 flex w-full max-w-4xl flex-col items-center justify-between gap-6 md:flex-row pointer-events-auto">
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left min-h-[7.5rem] md:h-32 justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {activeItem.meta && (
                  <span className="text-[0.65rem] md:text-xs font-medium uppercase tracking-wider text-purple-400">
                    {activeItem.meta}
                  </span>
                )}
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                  {activeItem.title}
                </h2>
                {activeItem.description && (
                  <p className="max-w-md text-sm md:text-base text-neutral-400">
                    {activeItem.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-1 rounded-full bg-black/60 p-1 ring-1 ring-white/10 backdrop-blur-md">
              <button
                onClick={handlePrev}
                className="rounded-full p-2.5 md:p-3 text-neutral-400 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Previous project"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[40px] text-center text-xs font-mono text-neutral-500">
                {activeIndex + 1} / {count}
              </span>
              <button
                onClick={handleNext}
                className="rounded-full p-2.5 md:p-3 text-neutral-400 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Next project"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {activeItem.readMoreContent && activeItem.readMoreContent.length > 0 ? (
              <button
                type="button"
                onClick={() => setReadMoreItem(activeItem)}
                className="group flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
              >
                read more
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            ) : (
              activeItem.href && (
                <Link
                  href={activeItem.href}
                  className="group flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                >
                  Explore
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {readMoreItem && (
        <ProjectLightbox
          item={readMoreItem}
          onClose={() => setReadMoreItem(null)}
        />
      )}
    </div>
  );
}

function ProjectLightbox({
  item,
  onClose,
}: {
  item: FocusRailItem;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const sections = item.readMoreContent ?? [];
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = React.useState(true);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollHint(el.scrollTop < 20);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .project-lightbox-scroll::-webkit-scrollbar { width: 6px; }
        .project-lightbox-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); border-radius: 3px; }
        .project-lightbox-scroll::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.5); border-radius: 3px; }
        .project-lightbox-scroll::-webkit-scrollbar-thumb:hover { background: rgba(168,85,247,0.7); }
        .project-lightbox-scroll { scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.5) rgba(255,255,255,0.06); }
      `}} />
      <div
        ref={scrollRef}
        className="project-lightbox-scroll relative z-10 w-full max-w-2xl max-h-[85vh] md:max-h-[72vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-black border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-4 right-4 ml-auto mr-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Scroll hint – shows when at top, fades when scrolled */}
        {showScrollHint && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-0.5"
            style={{ top: "min(38vh, 280px)" }}
          >
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Scroll for more</span>
            <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" strokeWidth={2.5} />
          </div>
        )}

        {/* Image: full width, object-top to crop bottom, no black on sides */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-black rounded-2xl">
          <Image
            src={item.imageSrc}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            priority
            className="object-cover object-top bg-black rounded-2xl scale-90"
            style={{ transformOrigin: "top center" }}
          />
        </div>

        <div className="px-5 md:px-6 pb-6 pt-4 border-t border-white/10 text-base md:text-[1.25em]">
          <h3 className="text-xl font-bold text-white mb-1.5">{item.title}</h3>
          {item.meta && (
            <p className="text-sm text-purple-400 mb-4">{item.meta}</p>
          )}
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              <h4 className="text-base font-semibold text-white mb-2">
                {section.title}
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-neutral-300">
                {section.items.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
