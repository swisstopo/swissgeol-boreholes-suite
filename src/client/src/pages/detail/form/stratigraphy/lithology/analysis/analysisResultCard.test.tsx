// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { FieldChange } from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { AnalysisResultCard } from "./analysisResultCard.tsx";
import { LithologyAnalysis } from "./useLithologyAnalysis.ts";

vi.mock("../../../../../../components/codelist.ts", () => ({
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The repository does not configure data-cy as the testing library's test id attribute, so the
// buttons are queried the way the other component tests query them.
const byDataCy = (value: string) => document.querySelector(`[data-cy="${value}"]`);

const change = (path: string, previous: FieldChange["previous"], next: FieldChange["next"]): FieldChange => ({
  path,
  labelKey: path,
  previous,
  next,
});

const analysis = (overrides: Partial<LithologyAnalysis> = {}): LithologyAnalysis => ({
  changeByPath: new Map([["a", change("a", null, 100)]]),
  isPending: false,
  hasPendingChanges: true,
  run: vi.fn(),
  acceptField: vi.fn(),
  resetField: vi.fn(),
  acceptAll: vi.fn(),
  resetAll: vi.fn(),
  discard: vi.fn(),
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe("AnalysisResultCard", () => {
  it("renders nothing when nothing is pending", () => {
    const { container } = render(
      <AnalysisResultCard analysis={analysis({ changeByPath: new Map(), hasPendingChanges: false })} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders one row per change with the empty marker for a previously empty value", () => {
    render(<AnalysisResultCard analysis={analysis()} />);

    expect(screen.getByText("emptyValueMarker")).toBeInTheDocument();
    expect(screen.getByText("code-100")).toBeInTheDocument();
  });

  it("shows the mode change card only when the mode changed", () => {
    render(<AnalysisResultCard analysis={analysis()} />);
    expect(screen.queryByText("modeSwitched")).not.toBeInTheDocument();

    cleanup();
    render(<AnalysisResultCard analysis={analysis({ modeChange: { previous: true, next: false } })} />);
    expect(screen.getByText("modeSwitched")).toBeInTheDocument();
    expect(screen.getByText("unconsolidated")).toBeInTheDocument();
    expect(screen.getByText("consolidated")).toBeInTheDocument();
  });

  it("stays visible for a pending mode change with no rows left", () => {
    render(
      <AnalysisResultCard
        analysis={analysis({ changeByPath: new Map(), modeChange: { previous: true, next: false } })}
      />,
    );

    expect(screen.getByText("analysis")).toBeInTheDocument();
  });

  it("resets and accepts a single row", () => {
    const current = analysis();
    render(<AnalysisResultCard analysis={current} />);

    fireEvent.click(byDataCy("a-analysis-row-reset")!);
    fireEvent.click(byDataCy("a-analysis-row-accept")!);

    expect(current.resetField).toHaveBeenCalledWith("a");
    expect(current.acceptField).toHaveBeenCalledWith("a");
  });

  it("resets everything without a prompt", () => {
    const current = analysis();
    render(<AnalysisResultCard analysis={current} />);

    fireEvent.click(byDataCy("analysis-reset-all")!);

    expect(current.resetAll).toHaveBeenCalled();
  });
});
