"use client";

import { EnumerationQuestion } from "@/components/question-types/EnumerationQuestion";
import { IdentificationQuestion } from "@/components/question-types/IdentificationQuestion";
import { MatchingQuestion } from "@/components/question-types/MatchingQuestion";
import { MultipleChoiceQuestion } from "@/components/question-types/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "@/components/question-types/TrueFalseQuestion";
import type { Question, UserAnswer } from "@/types/exam";

interface QuestionRendererProps {
  question: Question;
  answer: UserAnswer | undefined;
  onChange: (answer: UserAnswer) => void;
}

export function QuestionRenderer({
  question,
  answer,
  onChange,
}: QuestionRendererProps) {
  if (question.type === "true_false") {
    return (
      <TrueFalseQuestion
        question={question}
        value={answer as string | undefined}
        onChange={onChange}
      />
    );
  }

  if (question.type === "multiple_choice") {
    return (
      <MultipleChoiceQuestion
        question={question}
        value={answer as string | undefined}
        onChange={onChange}
      />
    );
  }

  if (question.type === "identification") {
    return (
      <IdentificationQuestion
        question={question}
        value={answer as string | undefined}
        onChange={onChange}
      />
    );
  }

  if (question.type === "matching") {
    return (
      <MatchingQuestion
        question={question}
        value={(answer as Record<string, string> | undefined) ?? {}}
        onChange={onChange}
      />
    );
  }

  return (
    <EnumerationQuestion
      question={question}
      value={Array.isArray(answer) ? (answer as string[]) : []}
      onChange={onChange}
    />
  );
}
