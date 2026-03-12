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
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Question Type Rules</p>
          <p className="text-xs text-muted-foreground">
            Toggle types and optionally set per-type minimums in one place.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {aiDecidesTypes && aiDecidesCounts
              ? "Enabled types are preferences; minimums are hard constraints if > 0."
              : aiDecidesTypes
                ? "AI can choose question types. Minimums still enforce required counts if > 0."
                : aiDecidesCounts
                  ? "Selected types are fixed. AI can still choose final counts within your minimum constraints."
                  : "Enable at least one type. Minimums are hard constraints if > 0."}
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
          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Min questions</span>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={minimumPerTypeInput[item.key]}
                  className="h-7 w-20 px-2 text-xs"
                  onChange={(e) => {
                    const raw = e.target.value;
                    onSetMinimumInput(item.key, raw);
                    const parsed = Number.parseInt(raw, 10);
                    if (Number.isFinite(parsed) && parsed > 0 && !enabled) {
                      onSetTypeEnabled(item.key, true);
                    }
                  }}
                  onBlur={() =>
                    onSetMinimumInput(
                      item.key,
                      String(minimumPerType[item.key] ?? 0),
                    )
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
