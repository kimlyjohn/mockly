"use client";

import { useMemo } from "react";

import { getExamResults, useExamStore } from "@/store/examStore";

import { Button } from "@/components/ui/Button";
import { ReviewQuestionCard } from "@/components/review/ReviewQuestionCard";
import { ScoreCard } from "@/components/review/ScoreCard";

export function ReviewView() {
  const {
    examData,
    userAnswers,
    retakeExam,
    retryIncorrect,
    retryMode,
    retryQuestionIds,
  } = useExamStore();

  const results = getExamResults();

  const wrongIds = useMemo(() => {
    if (!results) {
      return [] as string[];
    }
    return Object.values(results.perQuestion)
      .filter((item) => !item.isCorrect)
      .map((item) => item.questionId);
  }, [results]);

  if (!examData || !results) {
    return null;
  }

  const questionsToShow = retryMode
    ? examData.questions.filter((question) =>
        retryQuestionIds.includes(question.id),
      )
    : examData.questions;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4">
      <ScoreCard
        percentage={results.percentage}
        totalScore={results.totalScore}
        maxScore={results.maxScore}
        passingScore={examData.metadata.passingScore}
        questions={examData.questions}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={retakeExam}>
          Retake Full Exam
        </Button>
        <Button
          onClick={() => retryIncorrect(wrongIds)}
          disabled={wrongIds.length === 0}
        >
          Retry Incorrect ({wrongIds.length})
        </Button>
      </div>

      <div className="space-y-3">
        {questionsToShow.map((question, index) => (
          <ReviewQuestionCard
            key={question.id}
            index={index}
            question={question}
            userAnswer={userAnswers[question.id]}
            grade={results.perQuestion[question.id]}
          />
        ))}
      </div>
    </section>
  );
}
