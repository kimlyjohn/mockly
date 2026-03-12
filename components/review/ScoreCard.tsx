"use client";

import { useEffect, useMemo, useState } from "react";

import type { Question } from "@/types/exam";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ScoreCardProps {
  percentage: number;
  totalScore: number;
  maxScore: number;
  passingScore: number;
  questions: Question[];
}

export function ScoreCard({
  percentage,
  totalScore,
  maxScore,
  passingScore,
  questions,
}: ScoreCardProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplayPercentage(Math.round(percentage * progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [percentage]);

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - displayPercentage / 100);

  const byType = useMemo(() => {
    return questions.reduce<Record<string, number>>((acc, question) => {
      acc[question.type] = (acc[question.type] ?? 0) + 1;
      return acc;
    }, {});
  }, [questions]);

  const isPassed = percentage >= passingScore;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Submission Results
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            You scored {totalScore} out of {maxScore}
          </p>
        </div>

        <div className="relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="fill-none stroke-slate-200 stroke-8 dark:stroke-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="fill-none stroke-emerald-500 stroke-8 transition-all"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900 dark:text-slate-100">
            {displayPercentage}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Badge variant={isPassed ? "default" : "destructive"}>
          {isPassed ? "Passed" : "Needs Improvement"}
        </Badge>
        <span className="text-muted-foreground">
          Passing score: {passingScore}%
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(byType).map(([type, count]) => (
          <Badge key={type} variant="outline">
            {type.replaceAll("_", " ")}: {count}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
