import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorPayload {
  message?: string;
  details?: unknown;
}

export interface ApiEnvelope<T> {
  data?: T;
  error?: ApiErrorPayload;
}

export const ok = <T>(data: T, status = 200) => {
  return NextResponse.json({ data }, { status });
};

export const fail = (message: string, status = 400, details?: unknown) => {
  return NextResponse.json(
    {
      error: {
        message,
        details,
      },
    },
    { status },
  );
};

export const readJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON request body.");
  }
};

export const zodFail = (error: ZodError) => {
  return fail("Invalid request payload.", 400, error.flatten());
};

export const serverFail = (
  error: unknown,
  message = "Internal server error.",
) => {
  console.error(message, error);
  return fail(message, 500);
};
