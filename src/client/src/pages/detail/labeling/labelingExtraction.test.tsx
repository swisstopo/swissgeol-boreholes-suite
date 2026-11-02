// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PanelTab } from "../../../api/dataextractionInterfaces.ts";
import { OcrStatus } from "../../../api/generated";
import { BoreholeAttachment } from "../../../api/unionTypes.ts";
import { LabelingContext } from "./labelingContext.tsx";
import { LabelingExtraction } from "./labelingExtraction.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router", () => ({
  useParams: () => ({ id: "42" }),
}));

// The page always loads, so only the OCR status and the page text vary between tests.
const useExtractionBoundingBoxes = vi.fn<(...args: unknown[]) => unknown>();
vi.mock("../../../api/dataextraction.ts", () => ({
  extractCoordinates: vi.fn(),
  extractText: vi.fn(),
  useFileInfo: () => ({ data: { fileName: "uuid-1-1.png", count: 1 }, isError: false }),
  useExtractionBoundingBoxes: (...args: unknown[]) => useExtractionBoundingBoxes(...args),
}));

const ocrState: { status: OcrStatus | undefined } = { status: "Success" };
vi.mock("../../../api/profile.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("../../../api/profile.ts")>()),
  useProfileImage: () => ({ data: {}, isError: false }),
  useProfileOcrStatusOf: () => ocrState.status,
}));

vi.mock("../../../hooks/useShowAlertOnError.tsx", () => ({
  useShowAlertOnError: () => {},
}));

// Stand-in that exposes what the extraction hands to the text button.
vi.mock("../../../components/buttons/labelingButtons.tsx", () => ({
  TextExtractionButton: ({ disabled, disabledReason }: { disabled: boolean; disabledReason?: string }) => (
    <span aria-label="text-extraction" data-disabled={String(disabled)}>
      {disabledReason ?? ""}
    </span>
  ),
}));
vi.mock("./labelingDrawContainer.tsx", () => ({
  LabelingDrawContainer: () => <div />,
}));
vi.mock("../../../components/loadingBackdrop.tsx", () => ({
  LoadingBackdrop: () => <div aria-label="page-loading" />,
}));

const pageWithText = { data: { bounding_boxes: [{}] }, isPending: false, isError: false, error: null };
const notRequestedBoundingBoxes = { data: undefined, isPending: true, isError: false, error: null };

const renderExtraction = () =>
  render(
    <LabelingContext.Provider
      value={{
        panelPosition: "right",
        setPanelPosition: vi.fn(),
        panelOpen: true,
        togglePanel: vi.fn(),
        extractionObject: undefined,
        setExtractionObject: vi.fn(),
        extractionState: undefined,
        setExtractionState: vi.fn(),
        setAbortController: vi.fn(),
        cancelRequest: vi.fn(),
        panelTab: PanelTab.profile,
        setPanelTab: vi.fn(),
      }}>
      <LabelingExtraction
        selectedFile={{ id: 1, name: "profile.pdf", nameUuid: "uuid-1.pdf" } as BoreholeAttachment}
        activePage={1}
        showAlert={vi.fn()}
        closeAlert={vi.fn()}
      />
    </LabelingContext.Provider>,
  );

const textExtraction = () => screen.getByLabelText("text-extraction");

describe("LabelingExtraction", () => {
  beforeEach(() => {
    ocrState.status = "Success";
    useExtractionBoundingBoxes.mockReturnValue(pageWithText);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it.each<OcrStatus | undefined>([undefined, "Created", "Processing"])(
    "does not request the page text while OCR is %s",
    status => {
      ocrState.status = status;
      useExtractionBoundingBoxes.mockReturnValue(notRequestedBoundingBoxes);
      renderExtraction();

      expect(useExtractionBoundingBoxes).toHaveBeenLastCalledWith("uuid-1.pdf", expect.anything(), 1, false);
      expect(textExtraction().dataset.disabled).toBe("true");
      expect(textExtraction().textContent).toBe("msgLabelingWaitingForOcr");
      expect(screen.queryByLabelText("page-loading")).toBeNull();
    },
  );

  it("explains failed OCR on the text button", () => {
    ocrState.status = "Error";
    useExtractionBoundingBoxes.mockReturnValue(notRequestedBoundingBoxes);
    renderExtraction();

    expect(useExtractionBoundingBoxes).toHaveBeenLastCalledWith("uuid-1.pdf", expect.anything(), 1, false);
    expect(textExtraction().dataset.disabled).toBe("true");
    expect(textExtraction().textContent).toBe("msgLabelingOcrFailed");
  });

  it.each<OcrStatus>(["Success", "WillNotBeProcessed"])("enables text extraction once OCR is %s", status => {
    ocrState.status = status;
    renderExtraction();

    expect(useExtractionBoundingBoxes).toHaveBeenLastCalledWith("uuid-1.pdf", expect.anything(), 1, true);
    expect(textExtraction().dataset.disabled).toBe("false");
    expect(textExtraction().textContent).toBe("");
  });
});
