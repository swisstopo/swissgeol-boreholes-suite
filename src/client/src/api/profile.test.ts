// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { OcrStatus, ProfileOcrStatus } from "./generated";
import { ocrStatusIsTerminal } from "./profile";

const allTerminal: ProfileOcrStatus[] = [
  { id: 1, ocrStatus: "Success" },
  { id: 2, ocrStatus: "WillNotBeProcessed" },
  { id: 3, ocrStatus: "Error" },
];

const someProcessing: ProfileOcrStatus[] = [
  { id: 1, ocrStatus: "Success" },
  { id: 2, ocrStatus: "Processing" },
];

describe("ocrStatusIsTerminal", () => {
  it.each<OcrStatus>(["Success", "Error", "WillNotBeProcessed"])("returns true for terminal status %s", status => {
    expect(ocrStatusIsTerminal(status)).toBe(true);
  });

  it.each<OcrStatus>(["Created", "Processing"])("returns false for non-terminal status %s", status => {
    expect(ocrStatusIsTerminal(status)).toBe(false);
  });
});

// Mirrors the refetchInterval contract in useProfileOcrStatus: poll while any entry is non-terminal,
// stop otherwise. Tested as a pure function so we don't need to spin up a TanStack QueryClient.
const decidePollInterval = (data: ProfileOcrStatus[] | undefined): number | false =>
  data?.some(p => !ocrStatusIsTerminal(p.ocrStatus)) ? 2000 : false;

describe("OCR polling decision", () => {
  it("returns false when data is undefined", () => {
    expect(decidePollInterval(undefined)).toBe(false);
  });

  it("returns false when list is empty", () => {
    expect(decidePollInterval([])).toBe(false);
  });

  it("returns false when every entry is terminal", () => {
    expect(decidePollInterval(allTerminal)).toBe(false);
  });

  it("returns 2000 ms while any entry is non-terminal", () => {
    expect(decidePollInterval(someProcessing)).toBe(2000);
  });
});
