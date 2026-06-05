// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtractedLithologicalDescription, LithologicalDescription } from "../stratigraphy.ts";
import { StratigraphyExtractionItem } from "./stratigraphyExtractionItem.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The lithology table is exercised by its own suite; stub it so the test focuses on the alert.
vi.mock("../components/lithologyTable/lithologyTable.tsx", () => ({
  LithologyTable: () => <div data-testid="lithology-table" />,
}));

// Drives what the item sees as the current table descriptions; mutated per test before render/rerender.
let tableDescriptions: LithologicalDescription[] = [];
let tableHasErrors = false;
vi.mock("../components/lithologyTable/useLithologyTableState.ts", () => ({
  useLithologyTableState: () => ({
    depths: [],
    tmpLithologies: [],
    tmpLithologicalDescriptions: tableDescriptions,
    tmpFaciesDescriptions: [],
    stratigraphyId: 0,
    hasErrors: tableHasErrors,
    hasUnsavedChanges: false,
    updateDepthBoundaries: vi.fn(),
    handleAddDepthLayer: vi.fn(),
    handleInsertDepthRow: vi.fn(),
    handleDeleteDepthLayer: vi.fn(),
    handleDeleteDescription: vi.fn(),
    updateTmpLithology: vi.fn(),
    updateTmpLithologicalDescription: vi.fn(),
    updateTmpFaciesDescription: vi.fn(),
    resizeDescription: vi.fn(),
    reset: vi.fn(),
  }),
}));

const ALERT_KEY = "msgDepthsExtractionFailed";

const description = (fromDepth: number | null, toDepth: number | null): LithologicalDescription =>
  ({ id: 0, stratigraphyId: 0, fromDepth, toDepth }) as LithologicalDescription;

const renderItem = () =>
  render(
    <StratigraphyExtractionItem
      index={0}
      descriptions={[] as ExtractedLithologicalDescription[]}
      visible
      onStateChange={vi.fn()}
      name="Layer A"
      onNameChange={vi.fn()}
    />,
  );

const alert = () => screen.queryByText(ALERT_KEY);

describe("StratigraphyExtractionItem depth-extraction alert", () => {
  beforeEach(() => {
    tableDescriptions = [];
    tableHasErrors = false;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the alert when the extracted depths are initially unset", () => {
    tableDescriptions = [description(null, 10)];
    renderItem();
    expect(alert()).not.toBeNull();
  });

  it("does not show the alert when the extracted depths are initially complete", () => {
    tableDescriptions = [description(0, 10)];
    renderItem();
    expect(alert()).toBeNull();
  });

  it("hides the alert once the initially unset depths are filled in", () => {
    tableDescriptions = [description(null, 10)];
    const { rerender } = renderItem();
    expect(alert()).not.toBeNull();

    tableDescriptions = [description(0, 10)];
    rerender(
      <StratigraphyExtractionItem
        index={0}
        descriptions={[] as ExtractedLithologicalDescription[]}
        visible
        onStateChange={vi.fn()}
        name="Layer A"
        onNameChange={vi.fn()}
      />,
    );
    expect(alert()).toBeNull();
  });

  it("does not show the alert when the user clears a value that was initially set", () => {
    tableDescriptions = [description(0, 10)];
    const { rerender } = renderItem();
    expect(alert()).toBeNull();

    // User clears the start depth: a field-level error in the table, not a failed extraction.
    tableDescriptions = [description(null, 10)];
    rerender(
      <StratigraphyExtractionItem
        index={0}
        descriptions={[] as ExtractedLithologicalDescription[]}
        visible
        onStateChange={vi.fn()}
        name="Layer A"
        onNameChange={vi.fn()}
      />,
    );
    expect(alert()).toBeNull();
  });
});
