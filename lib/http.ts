import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
  return (await request.json()) as T;
};

export const zodFail = (error: ZodError) => {
  return fail("Invalid request payload.", 400, error.flatten());
};
