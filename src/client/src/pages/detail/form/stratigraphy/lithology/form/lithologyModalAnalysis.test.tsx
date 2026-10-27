// @vitest-environment jsdom
import { ReactNode } from "react";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { ClassifyResponse, ClassifyVariables } from "../../../../../../api/dataextractionInterfaces.ts";
import { Codelist } from "../../../../../../api/generated";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import { Prompt } from "../../../../../../components/prompt/prompt.tsx";
import { PromptContext, PromptProvider } from "../../../../../../components/prompt/promptContext.tsx";
import { ShowPrompt } from "../../../../../../components/prompt/promptInterface.ts";
import { LithologicalDescription, Lithology } from "../../stratigraphy.ts";
import { ConfirmAcceptAll } from "../analysis/useConfirmModeChange.tsx";
import { LithologyModal } from "./lithologyModal.tsx";
import { buildApplyHandler } from "./lithologyUtils.ts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

const classify = vi.fn<(variables: ClassifyVariables) => Promise<ClassifyResponse>>();

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

describe("buildApplyHandler", () => {
  it("applies straight away when nothing is pending", async () => {
    const apply = vi.fn();
    const confirmAcceptAll = vi.fn<ConfirmAcceptAll>();

    await buildApplyHandler(false, apply, confirmAcceptAll)();

    expect(apply).toHaveBeenCalled();
    expect(confirmAcceptAll).not.toHaveBeenCalled();
  });

  it("asks first when a change is still pending, and applies only on confirmation", async () => {
    const apply = vi.fn();
    const confirmAcceptAll = vi.fn<ConfirmAcceptAll>();

    await buildApplyHandler(true, apply, confirmAcceptAll)();

    expect(apply).not.toHaveBeenCalled();
    const [messageKey, onConfirm] = confirmAcceptAll.mock.calls[0];
    expect(messageKey).toBe("analysisAcceptAllOnCloseConfirm");

    onConfirm();

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
  });

  afterEach(() => {
    cleanup();
  });

  it("blocks another analysis until the open one is resolved", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    render(modalFor(lithology(1)), { wrapper: withAlerts });

    fireEvent.click(byDataCy("analyze-button")!);
    await waitFor(() => expect(byDataCy("analysis-result-card")).toBeInTheDocument());

    expect(byDataCy("analyze-button")).toBeDisabled();
  });

  it("reports a failed classification and leaves the form open for another try", async () => {
    classify.mockRejectedValue(new Error("service unavailable"));
    render(modalFor(lithology(1)), { wrapper: withAlerts });

    fireEvent.click(byDataCy("analyze-button")!);

    await waitFor(() => expect(showAlert).toHaveBeenCalledWith("errorLithologyClassification", "error"));
    expect(byDataCy("analysis-result-card")).not.toBeInTheDocument();
    expect(byDataCy("analyze-button")).toBeEnabled();
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

  it("keeps the analysis open when the apply leaves the modal open", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const showPrompt = vi.fn<ShowPrompt>();
    const updateLithology = vi.fn();
    const layer = lithology(1);
    render(
      <PromptContext.Provider
        value={{
          showPrompt,
          closePrompt: vi.fn(),
          promptIsOpen: false,
          message: "",
          actions: [],
          dialogContent: null,
        }}>
        <LithologyModal
          lithology={layer}
          lithologicalDescription={{ ...describedAsSilt(layer), depthIds: ["first", "second"] }}
          updateLithology={updateLithology}
          updateLithologicalDescription={vi.fn()}
        />
      </PromptContext.Provider>,
      { wrapper: withAlerts },
    );

    fireEvent.click(byDataCy("analyze-button")!);
    await waitFor(() => expect(byDataCy("analysis-result-card")).toBeInTheDocument());
    // A changed description that other layers share asks once more before it is saved.
    fireEvent.change(byDataCy("lithologicalDescription.description-formInput")!.querySelector("textarea")!, {
      target: { value: "Silt, grau" },
    });
    fireEvent.click(byDataCy("apply-button")!);
    const [, closeActions] = showPrompt.mock.calls[0];
    await act(async () => {
      closeActions.find(action => action.label === "acceptValues")?.action?.();
      await flushPromises();
    });
    const [, sharedDescriptionActions] = showPrompt.mock.calls[1];
    act(() => sharedDescriptionActions.find(action => action.label === "cancel")?.action?.());

    expect(updateLithology).not.toHaveBeenCalled();
    expect(byDataCy("analysis-result-card")).toBeInTheDocument();
  });

  it("shows the shared description prompt after the close prompt is confirmed", async () => {
    classify.mockResolvedValue({ consolidation: "unconsolidated", en_main: "si" });
    const layer = lithology(1);
    render(
      <PromptProvider>
        <Prompt />
        <LithologyModal
          lithology={layer}
          lithologicalDescription={{ ...describedAsSilt(layer), depthIds: ["first", "second"] }}
          updateLithology={vi.fn()}
          updateLithologicalDescription={vi.fn()}
        />
      </PromptProvider>,
      { wrapper: withAlerts },
    );

    fireEvent.click(byDataCy("analyze-button")!);
    await waitFor(() => expect(byDataCy("analysis-result-card")).toBeInTheDocument());
    fireEvent.change(byDataCy("lithologicalDescription.description-formInput")!.querySelector("textarea")!, {
      target: { value: "Silt, grau" },
    });
    fireEvent.click(byDataCy("apply-button")!);
    await waitFor(() => expect(byDataCy("acceptvalues-button")).toBeInTheDocument());
    fireEvent.click(byDataCy("acceptvalues-button")!);

    // The real prompt closes after its action, so the second prompt must survive that close.
    await waitFor(() => expect(byDataCy("prompt")).toHaveTextContent("confirmEditSharedLithologicalDescription"));
  });

  it("cancels a classification still running when the modal closes", async () => {
    let finishClassification: (response: ClassifyResponse) => void = () => {};
    classify.mockReturnValue(
      new Promise<ClassifyResponse>(resolve => {
        finishClassification = resolve;
      }),
    );
    const { rerender } = render(modalFor(lithology(1)), { wrapper: withAlerts });

    fireEvent.click(byDataCy("analyze-button")!);
    rerender(modalFor(undefined));

    expect(classify.mock.lastCall?.[0].signal.aborted).toBe(true);
    await act(async () => {
      finishClassification({ consolidation: "unconsolidated", en_main: "si" });
      await flushPromises();
    });
    expect(showAlert).not.toHaveBeenCalled();
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
