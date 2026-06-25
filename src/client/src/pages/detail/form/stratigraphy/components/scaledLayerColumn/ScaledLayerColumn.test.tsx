// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NavState } from "../../navigation/navState.ts";
import { ScaledLayerColumn } from "./ScaledLayerColumn.tsx";

const navState = (overrides: Partial<ConstructorParameters<typeof NavState>[0]> = {}) =>
  new NavState({ height: 500, rawLensSize: 100, contentHeights: { c: 100 }, ...overrides });

describe("ScaledLayerColumn", () => {
  afterEach(() => cleanup());

  it("renders no layers when the array is empty", () => {
    const { container } = render(<ScaledLayerColumn layers={[]} navState={navState()} renderLayer={() => <div />} />);
    expect(container.querySelectorAll("[data-testid^='scaled-layer-wrapper-']")).toHaveLength(0);
  });

  it("positions a layer at fromDepth times pixelPerMeter and sizes by thickness", () => {
    const { container } = render(
      <ScaledLayerColumn
        layers={[{ fromDepth: 10, toDepth: 30 }]}
        navState={navState()}
        renderLayer={() => <div>layer</div>}
      />,
    );
    // pixelPerMeter = 500/100 = 5; top = 10 * 5 = 50; height = 20 * 5 = 100
    const wrapper = container.querySelector<HTMLElement>("[data-testid='scaled-layer-wrapper-0']");
    expect(wrapper?.style.top).toBe("50px");
    expect(wrapper?.style.height).toBe("100px");
  });

  it("culls layers outside the lens window", () => {
    const { container } = render(
      <ScaledLayerColumn
        layers={[
          { id: "in", fromDepth: 0, toDepth: 5 },
          { id: "out", fromDepth: 200, toDepth: 220 },
        ]}
        navState={navState({ lensStart: 0, rawLensSize: 50, contentHeights: { c: 300 } })}
        renderLayer={() => <div>layer</div>}
        getKey={l => l.id}
      />,
    );
    expect(container.querySelector("[data-testid='scaled-layer-wrapper-in']")).not.toBeNull();
    expect(container.querySelector("[data-testid='scaled-layer-wrapper-out']")).toBeNull();
  });

  it("culls layers thinner than minPixelHeight", () => {
    const { container } = render(
      <ScaledLayerColumn
        layers={[
          { fromDepth: 0, toDepth: 0.1 }, // 0.1 * 5 = 0.5px, below floor of 1
          { fromDepth: 0.2, toDepth: 10 }, // 9.8 * 5 = 49px, visible
        ]}
        navState={navState()}
        renderLayer={() => <div>layer</div>}
        minPixelHeight={1}
      />,
    );
    expect(container.querySelectorAll("[data-testid^='scaled-layer-wrapper-']").length).toBe(1);
  });

  it("renders nothing when pixelPerMeter is not finite or positive", () => {
    // Default NavState has lensSize=0 -> pixelPerMeter = NaN
    const { container } = render(
      <ScaledLayerColumn
        layers={[{ fromDepth: 0, toDepth: 10 }]}
        navState={new NavState()}
        renderLayer={() => <div>layer</div>}
      />,
    );
    expect(container.querySelectorAll("[data-testid^='scaled-layer-wrapper-']")).toHaveLength(0);
  });
});
