"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MatchingQuestion as MatchingQuestionType } from "@/types/exam";
import { cn } from "@/lib/utils";

/**
 * Deterministic PRNG to ensure the shuffle order is stable for the same question ID
 * between re-renders, preventing hydration mismatches or jarring re-shuffles.
 */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

const COLOR_CLASSES = [
  {
    border: "border-emerald-400 dark:border-emerald-600",
    bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
    ring: "ring-emerald-400/50 dark:ring-emerald-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
    hoverBg: "hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20",
    line: "#10b981",
  },
  {
    border: "border-indigo-400 dark:border-indigo-600",
    bg: "bg-indigo-50/70 dark:bg-indigo-950/30",
    ring: "ring-indigo-400/50 dark:ring-indigo-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
    hoverBg: "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20",
    line: "#6366f1",
  },
  {
    border: "border-rose-400 dark:border-rose-600",
    bg: "bg-rose-50/70 dark:bg-rose-950/30",
    ring: "ring-rose-400/50 dark:ring-rose-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)]",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-800",
    hoverBg: "hover:bg-rose-50/30 dark:hover:bg-rose-950/20",
    line: "#f43f5e",
  },
  {
    border: "border-cyan-400 dark:border-cyan-600",
    bg: "bg-cyan-50/70 dark:bg-cyan-950/30",
    ring: "ring-cyan-400/50 dark:ring-cyan-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-800",
    hoverBg: "hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20",
    line: "#06b6d4",
  },
  {
    border: "border-amber-400 dark:border-amber-600",
    bg: "bg-amber-50/70 dark:bg-amber-950/30",
    ring: "ring-amber-400/50 dark:ring-amber-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
    hoverBg: "hover:bg-amber-50/30 dark:hover:bg-amber-950/20",
    line: "#f59e0b",
  },
  {
    border: "border-violet-400 dark:border-violet-600",
    bg: "bg-violet-50/70 dark:bg-violet-950/30",
    ring: "ring-violet-400/50 dark:ring-violet-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(139,92,246,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(139,92,246,0.4)]",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-800",
    hoverBg: "hover:bg-violet-50/30 dark:hover:bg-violet-950/20",
    line: "#8b5cf6",
  },
  {
    border: "border-orange-400 dark:border-orange-600",
    bg: "bg-orange-50/70 dark:bg-orange-950/30",
    ring: "ring-orange-400/50 dark:ring-orange-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(249,115,22,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)]",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-800",
    hoverBg: "hover:bg-orange-50/30 dark:hover:bg-orange-950/20",
    line: "#f97316",
  },
  {
    border: "border-pink-400 dark:border-pink-600",
    bg: "bg-pink-50/70 dark:bg-pink-950/30",
    ring: "ring-pink-400/50 dark:ring-pink-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(236,72,153,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)]",
    hoverBorder: "hover:border-pink-300 dark:hover:border-pink-800",
    hoverBg: "hover:bg-pink-50/30 dark:hover:bg-pink-950/20",
    line: "#ec4899",
  },
  {
    border: "border-blue-400 dark:border-blue-600",
    bg: "bg-blue-50/70 dark:bg-blue-950/30",
    ring: "ring-blue-400/50 dark:ring-blue-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-800",
    hoverBg: "hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
    line: "#3b82f6",
  },
  {
    border: "border-teal-400 dark:border-teal-600",
    bg: "bg-teal-50/70 dark:bg-teal-950/30",
    ring: "ring-teal-400/50 dark:ring-teal-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(20,184,166,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(20,184,166,0.4)]",
    hoverBorder: "hover:border-teal-300 dark:hover:border-teal-800",
    hoverBg: "hover:bg-teal-50/30 dark:hover:bg-teal-950/20",
    line: "#14b8a6",
  },
  {
    border: "border-fuchsia-400 dark:border-fuchsia-600",
    bg: "bg-fuchsia-50/70 dark:bg-fuchsia-950/30",
    ring: "ring-fuchsia-400/50 dark:ring-fuchsia-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(217,70,239,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]",
    hoverBorder: "hover:border-fuchsia-300 dark:hover:border-fuchsia-800",
    hoverBg: "hover:bg-fuchsia-50/30 dark:hover:bg-fuchsia-950/20",
    line: "#d946ef",
  },
  {
    border: "border-lime-400 dark:border-lime-600",
    bg: "bg-lime-50/70 dark:bg-lime-950/30",
    ring: "ring-lime-400/50 dark:ring-lime-500/50",
    shadow: "shadow-[0_0_15px_-3px_rgba(132,204,22,0.15)]",
    activeShadow: "shadow-[0_0_15px_-3px_rgba(132,204,22,0.4)]",
    hoverBorder: "hover:border-lime-300 dark:hover:border-lime-800",
    hoverBg: "hover:bg-lime-50/30 dark:hover:bg-lime-950/20",
    line: "#84cc16",
  },
];

interface MatchingQuestionProps {
  question: MatchingQuestionType;
  value?: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function MatchingQuestion({
  question,
  value = {},
  onChange,
}: MatchingQuestionProps) {
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [lines, setLines] = useState<
    Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
    }>
  >([]);

  const leftColorMap = useMemo(() => {
    const map: Record<string, (typeof COLOR_CLASSES)[number]> = {};
    question.options.left.forEach((left, i) => {
      map[left] = COLOR_CLASSES[i % COLOR_CLASSES.length];
    });
    return map;
  }, [question.options.left]);

  const rightToLeftMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [l, r] of Object.entries(value)) {
      map[r] = l;
    }
    return map;
  }, [value]);

  const shuffledRight = useMemo(() => {
    const random = mulberry32(hashString(question.id));
    const items = [...question.options.right];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [question.id, question.options.right]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    for (const [left, right] of Object.entries(value)) {
      const leftEl = leftRefs.current[left];
      const rightEl = rightRefs.current[right];
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();

        newLines.push({
          id: `${left}-${right}`,
          x1: leftRect.right - containerRect.left,
          y1: leftRect.top + leftRect.height / 2 - containerRect.top,
          x2: rightRect.left - containerRect.left,
          y2: rightRect.top + rightRect.height / 2 - containerRect.top,
          color: leftColorMap[left].line,
        });
      }
    }
    setLines(newLines);
  }, [value, leftColorMap]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateLines();
    const ro = new ResizeObserver(() => {
      updateLines();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, [updateLines]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
          {question.prompt}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Click a left item first, then click its matching right item.
        </p>
      </div>

      <div
        className="relative grid gap-y-6 sm:grid-cols-[1fr_1fr] sm:gap-x-16 md:gap-x-24 lg:gap-x-32"
        ref={containerRef}
      >
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full z-10 sm:block">
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
            />
          ))}
        </svg>

        <div className="relative z-20 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Left
          </p>
          {question.options.left.map((left) => {
            const isMatched = !!value[left];
            const isActive = activeLeft === left;
            const color = leftColorMap[left];

            return (
              <button
                key={left}
                ref={(el) => {
                  leftRefs.current[left] = el;
                }}
                onClick={() => setActiveLeft(left)}
                className={cn(
                  "relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 outline-none sm:p-4 bg-white dark:bg-slate-900",
                  isMatched
                    ? `${color.border} ${color.bg} ${color.shadow}`
                    : `border-slate-200 dark:border-slate-800 ${color.hoverBorder} ${color.hoverBg}`,
                  isActive
                    ? `z-30 scale-[1.03] ${color.border} ring-4 ${color.ring} ${color.activeShadow}`
                    : "",
                )}
              >
                <div className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                  {left}
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative z-20 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Right
          </p>
          {shuffledRight.map((right) => {
            const matchedLeft = rightToLeftMap[right];
            const isMatched = !!matchedLeft;
            const color = isMatched ? leftColorMap[matchedLeft] : null;

            return (
              <button
                key={right}
                ref={(el) => {
                  rightRefs.current[right] = el;
                }}
                onClick={() => {
                  if (!activeLeft) return;
                  const next = { ...value };
                  Object.entries(next).forEach(([l, r]) => {
                    if (r === right) delete next[l];
                  });
                  next[activeLeft] = right;
                  onChange(next);
                  setActiveLeft(null);
                }}
                className={cn(
                  "relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 outline-none sm:p-4 bg-white dark:bg-slate-900",
                  isMatched && color
                    ? `${color.border} ${color.bg} ${color.shadow}`
                    : activeLeft
                      ? `cursor-pointer border-slate-200 dark:border-slate-800 ${leftColorMap[activeLeft].hoverBorder}`
                      : "cursor-default border-slate-200 opacity-60 dark:border-slate-800 dark:opacity-50",
                  activeLeft && !isMatched ? "hover:scale-[1.02] hover:-translate-x-1" : ""
                )}
              >
                <div className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                  {right}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
