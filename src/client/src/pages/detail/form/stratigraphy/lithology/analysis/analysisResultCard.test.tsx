// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { FieldChange } from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { ShowPrompt } from "../../../../../../components/prompt/promptInterface.ts";
import { AnalysisResultCard } from "./analysisResultCard.tsx";
import { LithologyAnalysis } from "./useLithologyAnalysis.ts";

vi.mock("../../../../../../components/codelist.ts", () => ({
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

const renderWithPrompt = (current: LithologyAnalysis) => {
  const showPrompt = vi.fn<ShowPrompt>();
  render(
    <PromptContext.Provider
      value={{ showPrompt, closePrompt: vi.fn(), promptIsOpen: false, message: "", actions: [], dialogContent: null }}>
      <AnalysisResultCard analysis={current} />
    </PromptContext.Provider>,
  );
  return showPrompt;
};

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
  restoreAnalysisValue: vi.fn(),
  acceptAll: vi.fn(),
  resetAll: vi.fn(),
  discard: vi.fn(),
  isModeChangeFixed: false,
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

  it("sorts the rows alphabetically by attribute and reverses them on a header click", () => {
    const changeByPath = new Map([
      ["b", change("b", null, 1)],
      ["a", change("a", null, 2)],
    ]);
    const attributeOrder = () =>
      screen
        .getAllByRole("gridcell")
        .filter(cell => cell.dataset.field === "labelKey")
        .map(cell => cell.textContent);
    render(<AnalysisResultCard analysis={analysis({ changeByPath })} />);
    expect(attributeOrder()).toEqual(["a", "b"]);

    fireEvent.click(screen.getByText("attribute"));

    expect(attributeOrder()).toEqual(["b", "a"]);
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

  it("asks before the first accepted row makes the mode change final", () => {
    const current = analysis({ modeChange: { previous: true, next: false } });
    const showPrompt = renderWithPrompt(current);

    fireEvent.click(byDataCy("a-analysis-row-accept")!);

    expect(current.acceptField).not.toHaveBeenCalled();
    expect(showPrompt).toHaveBeenCalledOnce();
    const [, actions] = showPrompt.mock.calls[0];
    expect(actions.map(action => action.label)).toEqual(["cancel", "acceptChange"]);

    actions[1].action?.();

    expect(current.acceptField).toHaveBeenCalledWith("a");
  });

  it("accepts a row without asking once the mode change is fixed", () => {
    const current = analysis({ modeChange: { previous: true, next: false }, isModeChangeFixed: true });
    const showPrompt = renderWithPrompt(current);

    fireEvent.click(byDataCy("a-analysis-row-accept")!);

    expect(showPrompt).not.toHaveBeenCalled();
    expect(current.acceptField).toHaveBeenCalledWith("a");
  });

  it("resets everything without a prompt", () => {
    const current = analysis();
    render(<AnalysisResultCard analysis={current} />);

    fireEvent.click(byDataCy("analysis-reset-all")!);

    expect(current.resetAll).toHaveBeenCalled();
  });
});
