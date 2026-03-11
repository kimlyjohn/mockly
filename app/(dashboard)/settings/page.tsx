import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getSettings } from "@/lib/server/dashboard-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Control theme, autosave interval, retry behavior, and keyboard
          shortcuts.
        </p>
      </header>

      <SettingsForm initial={settings} />
    </section>
  );
}
