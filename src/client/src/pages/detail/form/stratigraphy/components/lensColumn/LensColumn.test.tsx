// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NavState } from "../../navigation/navState.ts";
import { LensColumn } from "./LensColumn.tsx";

interface SampleLayer {
  id: number;
  fromDepth: number;
  toDepth: number;
}

beforeAll(() => {
  // NavigationLens uses useResizeObserver internally; stub ResizeObserver so jsdom doesn't throw.
  global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

afterEach(() => cleanup());

describe("LensColumn", () => {
  it("renders one background entry per layer inside the navigation lens", () => {
    const navState = new NavState({ height: 500, rawLensSize: 100, contentHeights: { c: 100 } });
    const layers: SampleLayer[] = [
      { id: 1, fromDepth: 0, toDepth: 30 },
      { id: 2, fromDepth: 30, toDepth: 100 },
    ];
    const { container } = render(
      <LensColumn<SampleLayer>
        layers={layers}
        navState={navState}
        setNavState={vi.fn()}
        getColor={l => `rgb(${l.id * 50},0,0)`}
      />,
    );
    expect(container.querySelectorAll("[data-testid^='scaled-layer-wrapper-']").length).toBe(2);
  });

  it("renders no layer entries when layers array is empty", () => {
    const navState = new NavState({ height: 500, rawLensSize: 100, contentHeights: { c: 100 } });
    const { container } = render(
      <LensColumn<SampleLayer> layers={[]} navState={navState} setNavState={vi.fn()} getColor={() => "rgb(0,0,0)"} />,
    );
    expect(container.querySelectorAll("[data-testid^='scaled-layer-wrapper-']").length).toBe(0);
  });
});
