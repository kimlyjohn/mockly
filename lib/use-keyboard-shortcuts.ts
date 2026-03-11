"use client";

import { useEffect } from "react";

interface KeyboardShortcutProps {
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onToggleFlag: () => void;
  onSelectTf?: (value: "true" | "false") => void;
  onSelectMcqByIndex?: (index: number) => void;
}

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
};

export const useKeyboardShortcuts = ({
  onPrev,
  onNext,
  onSubmit,
  onToggleFlag,
  onSelectTf,
  onSelectMcqByIndex,
}: KeyboardShortcutProps) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "Enter") onNext();
      if (event.key === "Backspace") onPrev();
      if (event.key.toLowerCase() === "b") onToggleFlag();
      if (event.key.toLowerCase() === "t") onSelectTf?.("true");
      if (event.key.toLowerCase() === "f") onSelectTf?.("false");
      if (/^[1-4]$/.test(event.key))
        onSelectMcqByIndex?.(Number(event.key) - 1);
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") onSubmit();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onPrev, onSelectMcqByIndex, onSelectTf, onSubmit, onToggleFlag]);
};
