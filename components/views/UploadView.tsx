"use client";

import { FileQuestion, Play } from "lucide-react";
import { useState } from "react";

import { sampleExam } from "@/lib/sample-exam";
import type { Exam } from "@/types/exam";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { TemplateGeneratorModal } from "@/components/ui/template-generator-modal";

interface UploadViewProps {
  resumeExamTitle?: string;
  onLoadExam: (exam: Exam) => void;
  onResume: () => void;
}

export function UploadView({
  resumeExamTitle,
  onLoadExam,
  onResume,
}: UploadViewProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="overflow-hidden bg-linear-to-r from-emerald-500 to-teal-500 p-0 text-white">
        <div className="p-8">
          <h1 className="text-4xl font-bold tracking-tight">mockly</h1>
          <p className="mt-2 max-w-2xl text-emerald-50">
            Upload a validated exam JSON and turn it into an interactive mock
            exam experience.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={() => onLoadExam(sampleExam)}
            >
              Try Demo Exam
            </Button>
            <Button
              variant="ghost"
              leftIcon={<FileQuestion className="h-4 w-4" />}
              onClick={() => setIsTemplateOpen(true)}
            >
              Open AI Prompt Builder
            </Button>
          </div>
        </div>
      </Card>

      {resumeExamTitle && (
        <Card className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Resume previous exam:{" "}
            <span className="font-semibold">{resumeExamTitle}</span>
          </p>
          <Button onClick={onResume}>Resume</Button>
        </Card>
      )}

      <FileDropZone onValidExam={onLoadExam} />

      <TemplateGeneratorModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
      />
    </section>
  );
}
