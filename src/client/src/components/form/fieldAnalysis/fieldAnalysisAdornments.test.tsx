// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { FieldChange } from "./fieldAnalysis.ts";
import { FieldChangeSummary } from "./fieldAnalysisAdornments.tsx";

vi.mock("../../codelist.ts", () => ({
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const change = (overrides: Partial<FieldChange> = {}): FieldChange => ({
  path: "lithologyDescriptions.0.lithologyUnconMainId",
  labelKey: "lithologyUnconMain",
  previous: null,
  next: 100,
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe("FieldChangeSummary", () => {
  it("marks a previously empty value with the empty marker", () => {
    render(<FieldChangeSummary change={change()} />);

    expect(screen.getByText("emptyValueMarker")).toBeInTheDocument();
    expect(screen.getByText("code-100")).toBeInTheDocument();
  });

  it("strikes the previous value through", () => {
    render(<FieldChangeSummary change={change({ previous: 102 })} />);

    expect(screen.getByText("code-102")).toHaveStyle({ textDecoration: "line-through" });
  });

  it("joins a list value with commas", () => {
    render(<FieldChangeSummary change={change({ previous: [1, 2], next: [1, 3] })} />);

    expect(screen.getByText("code-1, code-2")).toBeInTheDocument();
    expect(screen.getByText("code-1, code-3")).toBeInTheDocument();
  });
});
