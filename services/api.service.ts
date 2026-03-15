import { getApiErrorMessage, readApiResponse } from "@/lib/api-client";

export const apiService = {
  fetcher: async <T>(url: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, init);
    const payload = await readApiResponse<{ data?: T }>(response);

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(response, payload, "An API error occurred."),
      );
    }

    if (!payload || !payload.data) {
      throw new Error("No data returned from API.");
    }

    return payload.data as T;
  },
};
