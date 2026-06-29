// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DiscreteScale } from "./DiscreteScale.tsx";
import { NavState } from "./navState.ts";

afterEach(cleanup);

const navStateFor = (overrides: Partial<{ lensStart: number; rawLensSize: number; height: number }>) =>
  new NavState({
    lensStart: overrides.lensStart ?? 0,
    rawLensSize: overrides.rawLensSize ?? 100,
    height: overrides.height ?? 500,
    contentHeights: { layer: 100 },
  });

describe("DiscreteScale", () => {
  it("renders nothing for empty depths", () => {
    const { container } = render(<DiscreteScale navState={navStateFor({})} depths={[]} />);
    expect(container.querySelectorAll("[data-cy='discrete-scale-tick']")).toHaveLength(0);
    expect(container.querySelectorAll("[data-cy='discrete-scale-label']")).toHaveLength(0);
  });

  it("renders one tick per visible depth", () => {
    const { container } = render(<DiscreteScale navState={navStateFor({})} depths={[0, 10, 25, 50, 100]} />);
    expect(container.querySelectorAll("[data-cy='discrete-scale-tick']")).toHaveLength(5);
  });

  it("does not render ticks for depths outside the visible window", () => {
    const navState = navStateFor({ lensStart: 20, rawLensSize: 30 }); // visible [20, 50]
    const { container } = render(<DiscreteScale navState={navState} depths={[0, 10, 25, 50, 75]} />);
    // visible boundaries: 25 and 50 (inclusive)
    expect(container.querySelectorAll("[data-cy='discrete-scale-tick']")).toHaveLength(2);
  });

  it("renders one label per visible depth when zoom gives ample spacing", () => {
    // height 500px / lensSize 100m → 5 px per metre.
    // Depths spaced 25m apart → 125 px between labels. MIN_LABEL_GAP_PX is 28.
    const { container } = render(<DiscreteScale navState={navStateFor({})} depths={[0, 25, 50, 75, 100]} />);
    expect(container.querySelectorAll("[data-cy='discrete-scale-label']")).toHaveLength(5);
  });

  it("formats integer labels with apostrophe thousand separator", () => {
    // Single visible depth always renders, so the assertion is stable across greedy/anchor passes.
    const navState = navStateFor({ lensStart: 1499, rawLensSize: 2 });
    const { getByText } = render(<DiscreteScale navState={navState} depths={[1500]} />);
    expect(getByText("1'500")).toBeInTheDocument();
  });

  it("preserves sub-meter precision in labels without padding zeros", () => {
    const navState = navStateFor({ lensStart: 1500, rawLensSize: 2 });
    const { getByText } = render(<DiscreteScale navState={navState} depths={[1500.5]} />);
    expect(getByText("1'500.5")).toBeInTheDocument();
  });

  it("hides middle labels at low zoom but keeps ticks", () => {
    // pixelPerMeter = 500 / 100 = 5 px/m. MIN_LABEL_GAP_PX = 28 → need >= 5.6m between labels.
    // depths spaced 2m apart → 10 px each → greedy keeps every third one (gap >= 28 px).
    const navState = navStateFor({});
    const depths = [0, 2, 4, 6, 8, 10];
    const { container } = render(<DiscreteScale navState={navState} depths={depths} />);
    expect(container.querySelectorAll("[data-cy='discrete-scale-tick']")).toHaveLength(6);
    const labels = container.querySelectorAll("[data-cy='discrete-scale-label']");
    // Greedy: 0 included; 2/4 skipped (gaps 10/20 < 28); 6 included (gap 30); 8 skipped;
    // 10 skipped. Bottom-anchor: deepest 10 not in, yDeepest-yPrev = 50-30 = 20 < 28,
    // so 10 replaces 6. Final labels: 0, 10.
    expect(labels).toHaveLength(2);
  });

  it("renders a single visible depth as a center label", () => {
    const navState = navStateFor({ lensStart: 30, rawLensSize: 5 }); // visible [30, 35]
    const { container } = render(<DiscreteScale navState={navState} depths={[10, 30.5, 80]} />);
    const labels = container.querySelectorAll("[data-cy='discrete-scale-label']");
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe("30.5");
  });

  it("keeps only the deepest label when two visible depths sit closer than the min gap", () => {
    // pixelPerMeter = 5. Two depths 1m apart → 5 px gap, below MIN_LABEL_GAP_PX (28).
    const navState = navStateFor({});
    const { container } = render(<DiscreteScale navState={navState} depths={[40, 41]} />);
    const labels = container.querySelectorAll("[data-cy='discrete-scale-label']");
    expect(container.querySelectorAll("[data-cy='discrete-scale-tick']")).toHaveLength(2);
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe("41");
  });
});
