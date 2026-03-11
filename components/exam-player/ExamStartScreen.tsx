"use client";

import type { Exam } from "@/types/exam";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";

interface ExamStartScreenProps {
  exam: Exam;
  onStart: () => void;
}

export function ExamStartScreen({ exam, onStart }: ExamStartScreenProps) {
  const typeCount = exam.questions.reduce<Record<string, number>>(
    (acc, question) => {
      acc[question.type] = (acc[question.type] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <Card className="space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {exam.title}
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {exam.description}
        </p>
      </div>

      <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
        <p>Questions: {exam.metadata.totalQuestions}</p>
        <p>Passing Score: {exam.metadata.passingScore}%</p>
        <p>Subject: {exam.metadata.subject ?? "General"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(typeCount).map(([key, count]) => (
          <Badge key={key} variant="outline">
            {key.replaceAll("_", " ")}: {count}
          </Badge>
        ))}
      </div>

      <Button className="w-full sm:w-auto" onClick={onStart}>
        Begin Exam
      </Button>
    </Card>
  );
}
