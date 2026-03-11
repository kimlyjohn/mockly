import { create } from "zustand";

import {
  clearSessionFromStorage,
  normalizeExamForLoad,
  readSessionFromStorage,
  saveSessionToStorage,
} from "@/lib/exam-runtime";
import { gradeExam } from "@/lib/grading";
import type { Exam, ExamStatus, UserAnswer } from "@/types/exam";

const STORAGE_KEY = "mockly_session";

export interface PersistedSession {
  examData: Exam;
  userAnswers: Record<string, UserAnswer>;
  currentQuestionIndex: number;
  flaggedQuestions: string[];
  retryMode: boolean;
  retryQuestionIds: string[];
  examStatus: ExamStatus;
}

interface ExamState {
  examData: Exam | null;
  userAnswers: Record<string, UserAnswer>;
  currentQuestionIndex: number;
  examStatus: ExamStatus;
  isNavigatorOpen: boolean;
  flaggedQuestions: Set<string>;
  retryMode: boolean;
  retryQuestionIds: string[];

  loadExam: (data: Exam) => void;
  startExam: () => void;
  setAnswer: (questionId: string, answer: UserAnswer) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  toggleFlag: (questionId: string) => void;
  submitExam: () => void;
  resetExam: () => void;
  retakeExam: () => void;
  retryIncorrect: (wrongIds: string[]) => void;
  toggleNavigator: () => void;
  hydrateFromStorage: () => void;
  clearStoredSession: () => void;
}

const saveSession = (state: ExamState): void => {
  if (!state.examData) {
    return;
  }

  const payload: PersistedSession = {
    examData: state.examData,
    userAnswers: state.userAnswers,
    currentQuestionIndex: state.currentQuestionIndex,
    flaggedQuestions: Array.from(state.flaggedQuestions),
    retryMode: state.retryMode,
    retryQuestionIds: state.retryQuestionIds,
    examStatus: state.examStatus,
  };

  saveSessionToStorage(STORAGE_KEY, payload);
};

export const useExamStore = create<ExamState>((set, get) => ({
  examData: null,
  userAnswers: {},
  currentQuestionIndex: 0,
  examStatus: "idle",
  isNavigatorOpen: true,
  flaggedQuestions: new Set<string>(),
  retryMode: false,
  retryQuestionIds: [],

  loadExam: (data) => {
    const normalized = normalizeExamForLoad(data);
    set({
      examData: normalized,
      userAnswers: {},
      currentQuestionIndex: 0,
      examStatus: "ready",
      flaggedQuestions: new Set<string>(),
      retryMode: false,
      retryQuestionIds: [],
      isNavigatorOpen: true,
    });
    saveSession(get());
  },

  startExam: () => {
    if (!get().examData) {
      return;
    }
    set({ examStatus: "in_progress" });
    saveSession(get());
  },

  setAnswer: (questionId, answer) => {
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questionId]: answer,
      },
    }));
    saveSession(get());
  },

  goToQuestion: (index) => {
    const questions = get().examData?.questions ?? [];
    if (questions.length === 0) {
      return;
    }
    const bounded = Math.max(0, Math.min(index, questions.length - 1));
    set({ currentQuestionIndex: bounded });
    saveSession(get());
  },

  goNext: () => {
    const state = get();
    const questions = state.examData?.questions ?? [];
    if (questions.length === 0) {
      return;
    }
    const nextIndex = Math.min(
      state.currentQuestionIndex + 1,
      questions.length - 1,
    );
    set({ currentQuestionIndex: nextIndex });
    saveSession(get());
  },

  goPrev: () => {
    const prevIndex = Math.max(get().currentQuestionIndex - 1, 0);
    set({ currentQuestionIndex: prevIndex });
    saveSession(get());
  },

  toggleFlag: (questionId) => {
    set((state) => {
      const next = new Set(state.flaggedQuestions);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return { flaggedQuestions: next };
    });
    saveSession(get());
  },

  submitExam: () => {
    set({ examStatus: "submitted" });
    saveSession(get());
  },

  resetExam: () => {
    set({
      examData: null,
      userAnswers: {},
      currentQuestionIndex: 0,
      examStatus: "idle",
      flaggedQuestions: new Set<string>(),
      retryMode: false,
      retryQuestionIds: [],
      isNavigatorOpen: true,
    });
    get().clearStoredSession();
  },

  retakeExam: () => {
    if (!get().examData) {
      return;
    }
    set({
      userAnswers: {},
      currentQuestionIndex: 0,
      examStatus: "ready",
      flaggedQuestions: new Set<string>(),
      retryMode: false,
      retryQuestionIds: [],
    });
    saveSession(get());
  },

  retryIncorrect: (wrongIds) => {
    const state = get();
    if (!state.examData || wrongIds.length === 0) {
      return;
    }

    set({
      userAnswers: {},
      currentQuestionIndex: 0,
      examStatus: "in_progress",
      retryMode: true,
      retryQuestionIds: wrongIds,
      flaggedQuestions: new Set<string>(),
    });
    saveSession(get());
  },

  toggleNavigator: () => {
    set((state) => ({ isNavigatorOpen: !state.isNavigatorOpen }));
  },

  hydrateFromStorage: () => {
    const parsed = readSessionFromStorage<PersistedSession>(STORAGE_KEY);
    if (!parsed) {
      return;
    }

    set({
      examData: parsed.examData,
      userAnswers: parsed.userAnswers,
      currentQuestionIndex: parsed.currentQuestionIndex,
      examStatus: parsed.examStatus,
      flaggedQuestions: new Set(parsed.flaggedQuestions),
      retryMode: parsed.retryMode,
      retryQuestionIds: parsed.retryQuestionIds,
    });
  },

  clearStoredSession: () => {
    clearSessionFromStorage(STORAGE_KEY);
  },
}));

export const getExamResults = (): ReturnType<typeof gradeExam> | null => {
  const state = useExamStore.getState();
  if (!state.examData) {
    return null;
  }

  const questions = state.retryMode
    ? state.examData.questions.filter((q) =>
        state.retryQuestionIds.includes(q.id),
      )
    : state.examData.questions;

  return gradeExam(questions, state.userAnswers);
};
