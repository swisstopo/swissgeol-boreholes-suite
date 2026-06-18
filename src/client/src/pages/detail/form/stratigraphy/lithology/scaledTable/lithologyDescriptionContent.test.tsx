// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { LithologicalDescription } from "../../stratigraphy.ts";
import { LithologyDescriptionContent } from "./lithologyDescriptionContent.tsx";

afterEach(() => {
  cleanup();
});

const description = (overrides: Partial<LithologicalDescription> = {}): LithologicalDescription => ({
  id: 1,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 10,
  description: "Sandy clay",
  ...overrides,
});

describe("LithologyDescriptionContent", () => {
  it("renders the description text", () => {
    render(<LithologyDescriptionContent description={description({ description: "Brown silty clay" })} />);
    expect(screen.getByText("Brown silty clay")).toBeInTheDocument();
  });

  it("preserves line breaks via pre-line whitespace", () => {
    render(<LithologyDescriptionContent description={description({ description: "Line one\nLine two" })} />);
    const node = screen.getByText(/Line one/);
    expect(node).toHaveStyle({ whiteSpace: "pre-line" });
  });
});
