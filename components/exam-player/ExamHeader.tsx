"use client";

import { Flag, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ProgressBar } from "./ProgressBar";

interface ExamHeaderProps {
  title: string;
  currentIndex: number;
  answeredCount: number;
  total: number;
  isNavigatorOpen: boolean;
  isCurrentFlagged: boolean;
  onToggleNavigator: () => void;
  onToggleFlag: () => void;
}

export function ExamHeader({
  title,
  currentIndex,
  answeredCount,
  total,
  isNavigatorOpen,
  isCurrentFlagged,
  onToggleNavigator,
  onToggleFlag,
}: ExamHeaderProps) {
  return (
    <header className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Question {currentIndex + 1} of {total}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isCurrentFlagged ? "secondary" : "ghost"}
            onClick={onToggleFlag}
            leftIcon={<Flag className="h-4 w-4" />}
            title="Shortcut: B"
          >
            {isCurrentFlagged ? "Flagged" : "Flag"}
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleNavigator}
            leftIcon={
              isNavigatorOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )
            }
          >
            {isNavigatorOpen ? "Hide Map" : "Show Map"}
          </Button>
        </div>
      </div>

      <ProgressBar current={answeredCount} total={total} />
    </header>
  );
}
