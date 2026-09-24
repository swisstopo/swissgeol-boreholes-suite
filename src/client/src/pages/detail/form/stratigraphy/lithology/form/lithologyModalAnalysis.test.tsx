// @vitest-environment jsdom
import { ReactNode } from "react";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { ClassifyResponse } from "../../../../../../api/dataextractionInterfaces.ts";
import { Codelist } from "../../../../../../api/generated";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import { ShowPrompt } from "../../../../../../components/prompt/promptInterface.ts";
import { LithologicalDescription, Lithology } from "../../stratigraphy.ts";
import { LithologyAnalysis } from "../analysis/useLithologyAnalysis.ts";
import { LithologyModal } from "./lithologyModal.tsx";
import { buildApplyHandler } from "./lithologyUtils.ts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

const classify = vi.fn();

// The one codelist entry that "Silt" classifies to.
const codelists: Codelist[] = [{ id: 102, schema: "lithology_uncon_main", code: "Si", en: "silt" }];

vi.mock("../../../../../../components/codelist.ts", () => ({
  useCodelists: () => ({ data: codelists }),
  useCodelistDisplayValues: () => (id: number) => ({ text: `code-${id}`, code: "" }),
}));

vi.mock("../../../../../../api/dataextraction.ts", () => ({
  useClassifyLithologicalDescription: () => ({ mutateAsync: classify, isPending: false }),
}));

// The layer forms take no part in the analysis lifecycle and make up most of the modal's render time.
vi.mock("./lithologyUnconsolidatedForm.tsx", () => ({ LithologyUnconsolidatedForm: () => null }));
vi.mock("./lithologyConsolidatedForm.tsx", () => ({ LithologyConsolidatedForm: () => null }));
vi.mock("./remarksFormSection.tsx", () => ({ RemarksFormSection: () => null }));

const analysis = (overrides: Partial<LithologyAnalysis> = {}): LithologyAnalysis => ({
  changeByPath: new Map(),
  isPending: false,
  hasPendingChanges: false,
  run: vi.fn(),
  acceptField: vi.fn(),
  resetField: vi.fn(),
  acceptAll: vi.fn(),
  resetAll: vi.fn(),
  discard: vi.fn(),
  ...overrides,
});

describe("buildApplyHandler", () => {
  it("applies straight away when nothing is pending", async () => {
    const apply = vi.fn();
    const showPrompt = vi.fn<ShowPrompt>();

    await buildApplyHandler(analysis(), apply, showPrompt)();

    expect(apply).toHaveBeenCalled();
    expect(showPrompt).not.toHaveBeenCalled();
  });

  it("asks first when a change is still pending, and applies only on confirmation", async () => {
    const apply = vi.fn();
    const showPrompt = vi.fn<ShowPrompt>();
    const current = analysis({ hasPendingChanges: true });

    await buildApplyHandler(current, apply, showPrompt)();

    expect(apply).not.toHaveBeenCalled();
    expect(showPrompt).toHaveBeenCalledWith(
      "analysisAcceptAllOnCloseConfirm",
      expect.arrayContaining([expect.objectContaining({ label: "cancel" })]),
    );

    const actions = showPrompt.mock.calls[0][1];
    actions.find(action => action.label === "acceptValues")?.action?.();

    expect(current.acceptAll).toHaveBeenCalled();
    expect(apply).toHaveBeenCalled();
  });
});

const byDataCy = (value: string) => document.querySelector(`[data-cy="${value}"]`);

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

const lithology = (id: number): Lithology => ({
  id,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 10,
  isUnconsolidated: true,
  hasBedding: false,
});

const describedAsSilt = (layer: Lithology): LithologicalDescription => ({
  id: layer.id + 100,
  stratigraphyId: layer.stratigraphyId,
  fromDepth: 0,
  toDepth: 10,
  description: "Silt",
});

// The table keeps one modal mounted for every row, so opening a row only changes these props.
const modalFor = (layer: Lithology | undefined) => (
  <LithologyModal
    lithology={layer}
    lithologicalDescription={layer && describedAsSilt(layer)}
    updateLithology={vi.fn()}
    updateLithologicalDescription={vi.fn()}
  />
);

const showAlert = vi.fn();

const withAlerts = ({ children }: { children: ReactNode }) => (
  <AlertContext.Provider value={{ alertIsOpen: false, text: undefined, showAlert, closeAlert: () => {} }}>
    {children}
  </AlertContext.Provider>
);

describe("LithologyModal", () => {
  beforeEach(() => {
    classify.mockReset();
    showAlert.mockClear();
    // The analyse action is only offered in dev mode.
    window.history.replaceState(null, "", "/?dev=true");
  });

  afterEach(() => {
    cleanup();
  });

  it("drops the analysis of the previous lithology when another one opens", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const { rerender } = render(modalFor(lithology(1)), { wrapper: withAlerts });

    fireEvent.click(byDataCy("analyze-button")!);
    await waitFor(() => expect(byDataCy("analysis-result-card")).toBeInTheDocument());
    rerender(modalFor(undefined));
    rerender(modalFor(lithology(2)));

    expect(byDataCy("analysis-result-card")).not.toBeInTheDocument();
  });

  it("ignores a classification still running when another lithology opens", async () => {
    let finishClassification: (response: ClassifyResponse) => void = () => {};
    classify.mockReturnValue(
      new Promise<ClassifyResponse>(resolve => {
        finishClassification = resolve;
      }),
    );
    const { rerender } = render(modalFor(lithology(1)), { wrapper: withAlerts });

    fireEvent.click(byDataCy("analyze-button")!);
    rerender(modalFor(undefined));
    rerender(modalFor(lithology(2)));
    await act(async () => {
      finishClassification({ consolidation: "unconsolidated", en_main: "si" });
      await flushPromises();
    });

    expect(byDataCy("analysis-result-card")).not.toBeInTheDocument();
    expect(showAlert).not.toHaveBeenCalled();
  });
});
