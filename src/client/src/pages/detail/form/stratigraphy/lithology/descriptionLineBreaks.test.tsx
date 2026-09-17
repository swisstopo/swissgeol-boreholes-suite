// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { FaciesDescription, Lithology } from "../stratigraphy.ts";
import { FaciesDescriptionLabels } from "./faciesDescriptionLabels.tsx";
import { LithologyLabels } from "./lithologyLabels.tsx";

// Both components resolve codelist ids through TanStack Query. Stubbing the hook is cheaper than
// wiring a QueryClientProvider, and matches how LithologyTableScaled.test.tsx isolates them.
vi.mock("../../../../../components/codelist.ts", () => ({
  useCodelistDisplayValues: () => () => ({ text: "", code: "" }),
}));

afterEach(() => {
  cleanup();
});

const twoLines = "Zeile eins.\nZeile zwei.";

const faciesDescription = (): FaciesDescription => ({
  id: 1,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 10,
  faciesId: null,
  description: twoLines,
});

const lithology = (): Lithology => ({
  id: 1,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 10,
  isUnconsolidated: false,
  hasBedding: false,
  notes: twoLines,
});

describe("description line breaks", () => {
  it("preserves line breaks in a facies description", () => {
    render(<FaciesDescriptionLabels description={faciesDescription()} />);

    expect(screen.getByText(/Zeile eins/)).toHaveStyle({ whiteSpace: "pre-line" });
  });

  it("preserves line breaks in lithology notes", () => {
    render(<LithologyLabels lithology={lithology()} />);

    expect(screen.getByText(/Zeile eins/)).toHaveStyle({ whiteSpace: "pre-line" });
  });
});
