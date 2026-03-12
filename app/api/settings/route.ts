import { ThemeSetting } from "@/app/generated/prisma/client";

import { updateSettingsSchema } from "@/lib/api-schema";
import { db } from "@/lib/db";
import { mapThemeSetting, themeFromDb } from "@/lib/exam-mappers";
import { fail, ok, readJson, serverFail, zodFail } from "@/lib/http";

const DEFAULT_SETTINGS = {
  theme: "light" as const,
  autosaveSeconds: 20,
  enableRetryIncorrect: true,
  enableKeyboardShortcuts: true,
};

const ensureSettings = async () => {
  return db.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
};

const normalizeTheme = (theme: ThemeSetting) => themeFromDb(theme);

export async function GET() {
  try {
    const settings = await ensureSettings();

    const response = ok({
      theme: normalizeTheme(settings.theme),
      autosaveSeconds: settings.autosaveSeconds,
      enableRetryIncorrect: settings.enableRetryIncorrect,
      enableKeyboardShortcuts: settings.enableKeyboardShortcuts,
      updatedAt: settings.updatedAt,
    });

    response.cookies.set({
      name: "mockly-theme",
      value: normalizeTheme(settings.theme),
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to load settings. Falling back to defaults.", error);

    const response = ok(DEFAULT_SETTINGS);
    response.cookies.set({
      name: "mockly-theme",
      value: DEFAULT_SETTINGS.theme,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return response;
  }
}

export async function PATCH(request: Request) {
  try {
    const raw = await readJson<unknown>(request);
    const parsed = updateSettingsSchema.safeParse(raw);
    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    if (!Object.keys(parsed.data).length) {
      return fail("No settings fields were provided.", 400);
    }

    const data = parsed.data;
    const updated = await db.appSettings.upsert({
      where: { id: 1 },
      update: {
        ...(data.theme ? { theme: mapThemeSetting(data.theme) } : {}),
        ...(data.autosaveSeconds !== undefined
          ? { autosaveSeconds: data.autosaveSeconds }
          : {}),
        ...(data.enableRetryIncorrect !== undefined
          ? { enableRetryIncorrect: data.enableRetryIncorrect }
          : {}),
        ...(data.enableKeyboardShortcuts !== undefined
          ? { enableKeyboardShortcuts: data.enableKeyboardShortcuts }
          : {}),
      },
      create: {
        id: 1,
        theme: data.theme ? mapThemeSetting(data.theme) : ThemeSetting.LIGHT,
        autosaveSeconds: data.autosaveSeconds ?? 20,
        enableRetryIncorrect: data.enableRetryIncorrect ?? true,
        enableKeyboardShortcuts: data.enableKeyboardShortcuts ?? true,
      },
    });

    const response = ok({
      theme: normalizeTheme(updated.theme),
      autosaveSeconds: updated.autosaveSeconds,
      enableRetryIncorrect: updated.enableRetryIncorrect,
      enableKeyboardShortcuts: updated.enableKeyboardShortcuts,
      updatedAt: updated.updatedAt,
    });

    response.cookies.set({
      name: "mockly-theme",
      value: normalizeTheme(updated.theme),
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return serverFail(error, "Failed to save settings.");
  }
}
