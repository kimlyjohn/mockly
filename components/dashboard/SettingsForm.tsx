"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ThemeMode = "light" | "dark";

interface SettingsFormProps {
  initial: {
    theme: ThemeMode;
    autosaveSeconds: number;
    enableRetryIncorrect: boolean;
    enableKeyboardShortcuts: boolean;
  };
}

const applyTheme = (theme: ThemeMode) => {
  localStorage.setItem("mockly-theme", theme);
  document.cookie = `mockly-theme=${theme}; path=/; max-age=31536000; samesite=lax`;

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>(initial.theme);
  const [autosaveSecondsInput, setAutosaveSecondsInput] = useState(
    String(initial.autosaveSeconds),
  );
  const [enableRetryIncorrect, setEnableRetryIncorrect] = useState(
    initial.enableRetryIncorrect,
  );
  const [enableKeyboardShortcuts, setEnableKeyboardShortcuts] = useState(
    initial.enableKeyboardShortcuts,
  );
  const [busy, setBusy] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizeAutosaveSeconds = (raw: string): number => {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return initial.autosaveSeconds;
    }
    return Math.max(5, Math.min(300, parsed));
  };

  const exportBackup = async () => {
    setBackupBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/backup/export", { cache: "no-store" });
      const payload = (await response.json()) as {
        data?: unknown;
        error?: {
          message?: string;
        };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Failed to export backup.");
      }

      const blob = new Blob([JSON.stringify(payload.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mockly-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage("Backup exported.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to export backup.",
      );
    } finally {
      setBackupBusy(false);
    }
  };

  const importBackup = async (file: File) => {
    setBackupBusy(true);
    setError(null);
    setMessage(null);

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;

      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        data?: {
          importedCount: number;
          skipped: string[];
        };
        error?: {
          message?: string;
        };
      };

      if (!response.ok || !result.data) {
        throw new Error(result.error?.message ?? "Failed to import backup.");
      }

      const skippedCount = result.data.skipped.length;
      setMessage(
        `Backup imported (${result.data.importedCount} exam${result.data.importedCount === 1 ? "" : "s"}, ${skippedCount} skipped).`,
      );
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to import backup.",
      );
    } finally {
      setBackupBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          autosaveSeconds: normalizeAutosaveSeconds(autosaveSecondsInput),
          enableRetryIncorrect,
          enableKeyboardShortcuts,
        }),
      });

      const payload = (await response.json()) as {
        error?: {
          message?: string;
        };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Failed to save settings.");
      }

      applyTheme(theme);
      setAutosaveSecondsInput(
        String(normalizeAutosaveSeconds(autosaveSecondsInput)),
      );
      setMessage("Settings updated.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to save settings.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">App Settings</h2>

      <div className="space-y-1.5">
        <Label htmlFor="theme-select">Theme</Label>
        <Select
          value={theme}
          onValueChange={(val) => setTheme(val as ThemeMode)}
        >
          <SelectTrigger id="theme-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="autosave-seconds">Autosave Seconds</Label>
        <Input
          id="autosave-seconds"
          type="number"
          min={5}
          max={300}
          value={autosaveSecondsInput}
          onChange={(event) => setAutosaveSecondsInput(event.target.value)}
          onBlur={() =>
            setAutosaveSecondsInput(
              String(normalizeAutosaveSeconds(autosaveSecondsInput)),
            )
          }
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="retry-incorrect"
          checked={enableRetryIncorrect}
          onCheckedChange={(v) => setEnableRetryIncorrect(!!v)}
        />
        <Label htmlFor="retry-incorrect" className="cursor-pointer font-normal">
          Enable retry incorrect mode
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="keyboard-shortcuts"
          checked={enableKeyboardShortcuts}
          onCheckedChange={(v) => setEnableKeyboardShortcuts(!!v)}
        />
        <Label
          htmlFor="keyboard-shortcuts"
          className="cursor-pointer font-normal"
        >
          Enable keyboard shortcuts
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={save}
          disabled={busy}
          leftIcon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        >
          {busy ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-sm font-medium">Data Tools</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => void exportBackup()}
            disabled={backupBusy}
            leftIcon={
              backupBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null
            }
          >
            {backupBusy ? "Working..." : "Export Backup"}
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent">
            Import Backup
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void importBackup(file);
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
