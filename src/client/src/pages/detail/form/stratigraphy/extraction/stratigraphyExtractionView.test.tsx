// @vitest-environment jsdom
import { act, cleanup, configure, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtractedStratigraphy } from "../../../../../api/dataextraction.ts";
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

const renderView = (props: { isLoading?: boolean; isError?: boolean; stratigraphies?: ExtractedStratigraphy[] }) =>
  render(
    <StratigraphyExtractionView
      file={{ id: 1, name: "profile.pdf", nameUuid: "uuid-1" } as BoreholeAttachment}
      allExtractedStratigraphies={props.stratigraphies ?? []}
      selectedIndex={0}
      onItemStateChange={vi.fn()}
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

  it("does not hint at a long extraction before the threshold", () => {
    vi.useFakeTimers();
    renderView({ isLoading: true });

    act(() => {
      vi.advanceTimersByTime(extractionTakingLongerThresholdMs - 1);
    });

    expect(screen.queryByTestId("stratigraphy-extraction-taking-longer")).toBeNull();
  });

  it("hints at a long extraction once the threshold has passed", () => {
    vi.useFakeTimers();
    renderView({ isLoading: true });

    act(() => {
      vi.advanceTimersByTime(extractionTakingLongerThresholdMs);
    });

    expect(screen.getByTestId("stratigraphy-extraction-taking-longer")).toBeDefined();
  });

  it("renders the extracted stratigraphies on success", () => {
    renderView({ stratigraphies: [{ pageNumbers: [1], descriptions: [] }] });

    expect(screen.getByLabelText("stratigraphy-item-0")).toBeDefined();
    expect(screen.queryByTestId("stratigraphy-extraction-empty")).toBeNull();
  });
});
