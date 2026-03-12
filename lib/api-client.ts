import type { ApiEnvelope } from "@/lib/http";

export const readApiResponse = async <T>(
  response: Response,
): Promise<ApiEnvelope<T> | null> => {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    return null;
  }
};

export const getApiErrorMessage = <T>(
  response: Response,
  payload: ApiEnvelope<T> | null,
  fallback: string,
) => {
  return (
    payload?.error?.message ??
    (response.status ? `${fallback} (HTTP ${response.status}).` : fallback)
  );
};
