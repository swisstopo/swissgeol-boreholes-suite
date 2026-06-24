// @vitest-environment jsdom
import { Dispatch, SetStateAction, useLayoutEffect, useRef, useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavigationContainer } from "./NavigationContainer.tsx";
import { NavState } from "./navState.ts";

type Subscription = {
  target: Element;
  cb: (entry: { contentRect: { height: number } }) => void;
};

// `vi.hoisted` is the only way to share state with a `vi.mock` factory (mocks are hoisted above
// imports, so module-level `const` declarations aren't visible to them).
const { subscriptions } = vi.hoisted(() => ({
  subscriptions: [] as Subscription[],
}));

// Replace the underlying resize-observer hook with a synchronous registry. The real lib batches via
// requestAnimationFrame and reads `window.ResizeObserver` at module-eval time, which makes raw
// jsdom mocking flaky. This shim keeps the public surface (a hook taking a ref + callback) intact
// while letting tests fire resize events directly against a known element.
vi.mock("@react-hook/resize-observer", () => ({
  default: function useResizeObserverMock(
    target: { current: Element | null } | Element | null,
    cb: (entry: { contentRect: { height: number } }) => void,
  ) {
    useLayoutEffect(() => {
      const el = target && typeof target === "object" && "current" in target ? target.current : target;
      if (!el) return;
      const sub: Subscription = { target: el as Element, cb };
      subscriptions.push(sub);
      return () => {
        const i = subscriptions.indexOf(sub);
        if (i >= 0) subscriptions.splice(i, 1);
      };
    }, [target, cb]);
  },
}));

afterEach(() => {
  cleanup();
  subscriptions.length = 0;
});

const resizeTo = (target: Element, height: number) => {
  subscriptions.filter(s => s.target === target).forEach(s => s.cb({ contentRect: { height } }));
};

interface HarnessProps {
  withBodyRef: boolean;
  expose: (state: NavState, setState: Dispatch<SetStateAction<NavState>>) => void;
}

const Harness = ({ withBodyRef, expose }: HarnessProps) => {
  const [state, setState] = useState<NavState>(new NavState());
  const bodyRef = useRef<HTMLDivElement>(null);
  expose(state, setState);
  return (
    <NavigationContainer
      navState={state}
      onNavStateChange={setState}
      bodyRef={withBodyRef ? bodyRef : undefined}
      renderItems={() => <div ref={bodyRef} data-testid="body" />}
    />
  );
};

describe("NavigationContainer", () => {
  it("uses bodyRef to drive navState.height when provided", () => {
    // Regression for the lithology grid layout: the container wraps a header row + body row +
    // lens-down row, so the container's height includes pixels that are NOT available for the
    // depth-proportional cells. Observing the body row directly keeps pixelPerMeter honest.
    let latest: NavState = new NavState();
    const { getByTestId, container } = render(<Harness withBodyRef expose={state => (latest = state)} />);
    const body = getByTestId("body");
    const containerEl = container.firstChild as HTMLElement;
    act(() => {
      // Simulate the grid: container is taller than its body by the header + footer rows.
      resizeTo(containerEl, 780);
      resizeTo(body, 700);
    });
    expect(latest.height).toBe(700);
  });

  it("falls back to the container's height when bodyRef is omitted (stack-mode panels)", () => {
    let latest: NavState = new NavState();
    const { container } = render(<Harness withBodyRef={false} expose={state => (latest = state)} />);
    const containerEl = container.firstChild as HTMLElement;
    act(() => resizeTo(containerEl, 500));
    expect(latest.height).toBe(500);
  });
});
