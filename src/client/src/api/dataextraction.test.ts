// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mapExtractionResponse, useExtractStratigraphies } from "./dataextraction.ts";
import { ExtractionBoundingBox, StratigraphyExtractionResponse } from "./dataextractionInterfaces.ts";
import { BoreholeAttachment } from "./unionTypes.ts";

vi.mock("./authentication.ts", () => ({
  getAuthorizationHeader: () => "Bearer token",
}));

vi.mock("../auth/authTokenStore.ts", () => ({
  getAuthToken: () => "token",
}));

// The extraction query only runs once the file info query resolved, so it is stubbed out here.
vi.mock("./fetchApiV2.ts", () => ({
  fetchApiV2WithApiError: vi.fn(async () => ({ fileName: "profile.pdf", count: 1 })),
}));

const layer = (text: string) => ({
  start: { depth: 0, bounding_boxes: [] as ExtractionBoundingBox[] },
  end: { depth: 1, bounding_boxes: [] as ExtractionBoundingBox[] },
  material_description: { text, bounding_boxes: [] as ExtractionBoundingBox[] },
});

const responseWith = (...texts: string[]): StratigraphyExtractionResponse => ({
  boreholes: [{ id: "b1", page_numbers: [1], layers: texts.map(layer) }],
});

describe("mapExtractionResponse", () => {
  it("drops layers with an empty description", () => {
    const result = mapExtractionResponse(responseWith("Gravel", "", "Sand"));

    expect(result[0].descriptions.map(d => d.description)).toEqual(["Gravel", "Sand"]);
  });

  it("keeps layers with a non-empty description", () => {
    const result = mapExtractionResponse(responseWith("Gravel", "Sand"));

    expect(result[0].descriptions).toHaveLength(2);
  });

  it("returns no descriptions when every layer has an empty description", () => {
    const result = mapExtractionResponse(responseWith("", ""));

    expect(result[0].descriptions).toHaveLength(0);
  });

  it("preserves line breaks in the description", () => {
    const result = mapExtractionResponse(responseWith("Zeile 1.\nZeile 2.", "Zeile 3.\r\nZeile 4."));

    expect(result[0].descriptions.map(d => d.description)).toEqual(["Zeile 1.\nZeile 2.", "Zeile 3.\r\nZeile 4."]);
  });
});

// Mirrors the app's default of retrying queries, to prove the extraction query opts out of it.
const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 3, retryDelay: 0 } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const profile = { id: 1, name: "profile.pdf", nameUuid: "uuid-1" } as BoreholeAttachment;

describe("useExtractStratigraphies", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("gateway timeout", { status: 504 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("does not retry a failed extraction, even when queries retry by default", async () => {
    const { result } = renderHook(() => useExtractStratigraphies(profile, 1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const extractionCalls = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes("extract_stratigraphy"));
    expect(extractionCalls).toHaveLength(1);
  });
});
