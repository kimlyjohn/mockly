import { describe, expect, it } from "vitest";

import { getApiErrorMessage, readApiResponse } from "@/lib/api-client";

describe("api client", () => {
  it("parses a valid API envelope", async () => {
    const response = new Response(JSON.stringify({ data: { id: "abc" } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = await readApiResponse<{ id: string }>(response);

    expect(payload?.data?.id).toBe("abc");
  });

  it("returns null for an empty response body", async () => {
    const response = new Response(null, { status: 500 });

    const payload = await readApiResponse(response);

    expect(payload).toBeNull();
  });

  it("returns null for invalid json", async () => {
    const response = new Response("not-json", { status: 500 });

    const payload = await readApiResponse(response);

    expect(payload).toBeNull();
  });

  it("builds a fallback error message when the payload is missing", () => {
    const response = new Response(null, { status: 500 });

    expect(getApiErrorMessage(response, null, "Failed to load attempt.")).toBe(
      "Failed to load attempt. (HTTP 500).",
    );
  });
});
