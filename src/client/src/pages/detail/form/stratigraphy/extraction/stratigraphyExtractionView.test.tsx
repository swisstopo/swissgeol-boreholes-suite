// @vitest-environment jsdom
import { act, cleanup, configure, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtractedStratigraphy } from "../../../../../api/dataextraction.ts";
import { OcrStatus } from "../../../../../api/generated";
import { BoreholeAttachment } from "../../../../../api/unionTypes.ts";
import { extractionTakingLongerThresholdMs, StratigraphyExtractionView } from "./stratigraphyExtractionView.tsx";

configure({ testIdAttribute: "data-cy" });

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The right-hand pane renders a pdf canvas and page navigation that are irrelevant to the
// loading, error and empty states under test.
vi.mock("../../../labeling/extractionImageContainer.tsx", () => ({
  ExtractionImageContainer: () => <div />,
}));
vi.mock("../../../labeling/pageSelection.tsx", () => ({
  PageSelection: () => <div />,
}));
vi.mock("./stratigraphyExtractionItem.tsx", () => ({
  StratigraphyExtractionItem: ({ index }: { index: number }) => <div aria-label={`stratigraphy-item-${index}`} />,
}));

const onRetry = vi.fn();

const renderView = (props: {
  ocrStatus?: OcrStatus;
  isLoading?: boolean;
  isError?: boolean;
  stratigraphies?: ExtractedStratigraphy[];
}) =>
  render(
    <StratigraphyExtractionView
      file={{ id: 1, name: "profile.pdf", nameUuid: "uuid-1" } as BoreholeAttachment}
      allExtractedStratigraphies={props.stratigraphies ?? []}
      selectedIndex={0}
      onItemStateChange={vi.fn()}
      ocrStatus={props.ocrStatus ?? "Success"}
      isLoading={props.isLoading ?? false}
      isError={props.isError ?? false}
      onRetry={onRetry}
      activePage={1}
      setActivePage={vi.fn()}
      names={new Map()}
      nameErrors={new Map()}
      onNameChange={vi.fn()}
    />,
  );

describe("StratigraphyExtractionView", () => {
  beforeEach(() => {
    onRetry.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the empty state when the extraction found nothing", () => {
    renderView({ stratigraphies: [] });

    expect(screen.getByTestId("stratigraphy-extraction-empty")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-error")).toBeNull();
  });

  it("shows the error state with a retry button when the extraction failed", () => {
    renderView({ isError: true });

    expect(screen.getByTestId("stratigraphy-extraction-error")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-empty")).toBeNull();

    fireEvent.click(screen.getByTestId("retry-stratigraphy-extraction-button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it.each<OcrStatus>(["Created", "Processing"])(
    "asks for patience instead of showing a result while OCR is %s",
    ocrStatus => {
      renderView({ ocrStatus, stratigraphies: [] });

      expect(screen.getByTestId("stratigraphy-extraction-ocr-running")).toBeDefined();
      expect(screen.queryByTestId("stratigraphy-extraction-empty")).toBeNull();
    },
  );

  it("shows the error with a retry button instead of the OCR hint when loading failed", () => {
    renderView({ ocrStatus: "Processing", isError: true });

    expect(screen.getByTestId("stratigraphy-extraction-error")).toBeDefined();
    expect(screen.getByTestId("retry-stratigraphy-extraction-button")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-ocr-running")).toBeNull();
  });

  it("keeps showing only the OCR hint past the long-extraction threshold", () => {
    vi.useFakeTimers();
    renderView({ ocrStatus: "Processing", isLoading: true });

    act(() => {
      vi.advanceTimersByTime(extractionTakingLongerThresholdMs);
    });

    expect(screen.queryByTestId("stratigraphy-extraction-taking-longer")).toBeNull();
  });

  it("reports failed OCR instead of a result and without offering a retry", () => {
    renderView({ ocrStatus: "Error", stratigraphies: [] });

    expect(screen.getByTestId("stratigraphy-extraction-ocr-failed")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-empty")).toBeNull();
    expect(screen.queryByTestId("retry-stratigraphy-extraction-button")).toBeNull();
  });

  it.each<OcrStatus>(["Success", "WillNotBeProcessed"])("does not report failed OCR when it is %s", ocrStatus => {
    renderView({ ocrStatus, stratigraphies: [] });

    expect(screen.queryByTestId("stratigraphy-extraction-ocr-failed")).toBeNull();
  });

  it("does not hint at a long extraction before the threshold", () => {
    vi.useFakeTimers();
    renderView({ isLoading: true });

    act(() => {
      vi.advanceTimersByTime(extractionTakingLongerThresholdMs - 1);
    });

    expect(screen.queryByTestId("stratigraphy-extraction-taking-longer")).toBeNull();
    expect(screen.getByTestId("stratigraphy-extraction-running")).toBeDefined();
  });

  it("hints at a long extraction once the threshold has passed", () => {
    vi.useFakeTimers();
    renderView({ isLoading: true });

    act(() => {
      vi.advanceTimersByTime(extractionTakingLongerThresholdMs);
    });

    expect(screen.getByTestId("stratigraphy-extraction-taking-longer")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-running")).toBeNull();
  });

  it("renders the extracted stratigraphies on success", () => {
    renderView({ stratigraphies: [{ pageNumbers: [1], descriptions: [] }] });

    expect(screen.getByLabelText("stratigraphy-item-0")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-empty")).toBeNull();
  });
});
