import type { Exam, UserAnswer } from "@/types/exam";
import type { ExamGradeResult } from "@/lib/grading";

export type AttemptStatus = "in_progress" | "submitted" | "abandoned";

export interface AttemptPayload {
  id: string;
  examId: string;
  status: AttemptStatus;
  currentQuestionIndex: number;
  elapsedSeconds: number;
  percentage: number | null;
  flaggedQuestionIds: string[];
  answers: Record<string, UserAnswer>;
  exam: Exam;
}

export interface SubmitPayload {
  attempt: {
    id: string;
    status: AttemptStatus;
    percentage?: number;
    grade: ExamGradeResult;
  };
  exam: Exam;
}

export const formatElapsedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};
