export type QuestionType =
  | "true_false"
  | "multiple_choice"
  | "identification"
  | "matching"
  | "enumeration";

export interface ExamMetadata {
  totalQuestions: number;
  passingScore: number;
  subject?: string;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  correctAnswer: "true" | "false";
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];
  correctAnswer: string;
}

export interface IdentificationNoChoicesQuestion extends BaseQuestion {
  type: "identification";
  hasChoices: false;
  correctAnswer: string;
}

export interface IdentificationWithChoicesQuestion extends BaseQuestion {
  type: "identification";
  hasChoices: true;
  options: string[];
  correctAnswer: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  options: {
    left: string[];
    right: string[];
  };
  correctAnswer: Record<string, string>;
}

export interface EnumerationQuestion extends BaseQuestion {
  type: "enumeration";
  correctAnswer: string[];
  orderedAnswer?: boolean;
}

export type Question =
  | TrueFalseQuestion
  | MultipleChoiceQuestion
  | IdentificationNoChoicesQuestion
  | IdentificationWithChoicesQuestion
  | MatchingQuestion
  | EnumerationQuestion;

export interface Exam {
  title: string;
  description: string;
  metadata: ExamMetadata;
  questions: Question[];
}

export type UserAnswer = string | string[] | Record<string, string>;

export type ExamStatus = "idle" | "ready" | "in_progress" | "submitted";
