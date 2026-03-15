import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";

export type ExamAttemptHistoryItem = {
  id: string;
  status: "in_progress" | "submitted" | "abandoned";
  currentQuestionIndex: number;
  elapsedSeconds: number;
  submittedAt: string | null;
  totalScore: number | null;
  maxScore: number | null;
  percentage: number | null;
  answersCount: number;
  createdAt: string;
  updatedAt: string;
};

export function useAttemptHistory(examId: string, enabled = true) {
  return useQuery({
    queryKey: ["exams", examId, "attempts"],
    queryFn: () =>
      apiService.fetcher<ExamAttemptHistoryItem[]>(
        `/api/exams/${examId}/attempts`,
      ),
    enabled,
    staleTime: 30 * 1000,
  });
}
