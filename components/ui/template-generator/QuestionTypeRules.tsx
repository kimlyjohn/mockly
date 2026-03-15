"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateTypeSelection } from "@/lib/template-generator";

const TYPES: Array<{ key: TemplateTypeSelection; label: string }> = [
  { key: "true_false", label: "True/False" },
  { key: "multiple_choice", label: "Multiple Choice" },
  { key: "identification_no_choices", label: "Identification (No Choices)" },
  {
    key: "identification_with_choices",
    label: "Identification (With Choices)",
  },
  { key: "matching", label: "Matching" },
  { key: "enumeration", label: "Enumeration" },
];

interface QuestionTypeRulesProps {
  aiDecidesTypes: boolean;
  aiDecidesCounts: boolean;
  isTypeEnabled: (type: TemplateTypeSelection) => boolean;
  onSetTypeEnabled: (type: TemplateTypeSelection, enabled: boolean) => void;
  minimumPerTypeInput: Record<TemplateTypeSelection, string>;
  minimumPerType: Partial<Record<TemplateTypeSelection, number>>;
  onSetMinimumInput: (type: TemplateTypeSelection, raw: string) => void;
  onEnableAll: () => void;
  onResetAll: () => void;
}

export function QuestionTypeRules({
  aiDecidesTypes,
  aiDecidesCounts,
  isTypeEnabled,
  onSetTypeEnabled,
  minimumPerTypeInput,
  minimumPerType,
  onSetMinimumInput,
  onEnableAll,
  onResetAll,
}: QuestionTypeRulesProps) {
  if (aiDecidesTypes) {
    return null;
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Question Type Rules</p>
          <p className="text-xs text-muted-foreground">
            Select question types to include in the generated exam.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {aiDecidesCounts
              ? "AI will decide counts for selected question types."
              : "Set exact question counts for selected types."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEnableAll}>
            Enable all
          </Button>
          <Button variant="outline" size="sm" onClick={onResetAll}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {TYPES.map((item) => {
          const enabled = isTypeEnabled(item.key);
          const showCountInput = enabled && !aiDecidesCounts;

          return (
            <div
              key={item.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Checkbox
                  id={`type-${item.key}`}
                  checked={enabled}
                  onCheckedChange={(v) => onSetTypeEnabled(item.key, !!v)}
                />
                <Label
                  htmlFor={`type-${item.key}`}
                  className="cursor-pointer truncate font-normal"
                >
                  {item.label}
                </Label>
              </div>

              {showCountInput && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Question count</span>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={minimumPerTypeInput[item.key]}
                    className="h-7 w-20 px-2 text-xs"
                    onChange={(e) => {
                      const raw = e.target.value;
                      onSetMinimumInput(item.key, raw);
                    }}
                    onBlur={() =>
                      onSetMinimumInput(
                        item.key,
                        String(Math.max(1, minimumPerType[item.key] ?? 1)),
                      )
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
