// @vitest-environment jsdom
import { FC, PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldChange } from "./fieldAnalysis.ts";
import { FieldAnalysisProvider, useFieldAnalysis } from "./fieldAnalysisContext.tsx";

const change: FieldChange = {
  path: "lithologyDescriptions.0.lithologyUnconMainId",
  labelKey: "lithologyUnconMain",
  previous: null,
  next: 100,
};

describe("useFieldAnalysis", () => {
  it("returns nothing when no provider is mounted, so every other form is unaffected", () => {
    const { result } = renderHook(() => useFieldAnalysis(change.path));

    expect(result.current).toBeUndefined();
  });

  it("returns nothing for a field the analysis did not touch", () => {
    const onResetField = vi.fn();
    const wrapper: FC<PropsWithChildren> = ({ children }) => (
      <FieldAnalysisProvider changeByPath={new Map([[change.path, change]])} onResetField={onResetField}>
        {children}
      </FieldAnalysisProvider>
    );

    const { result } = renderHook(() => useFieldAnalysis("notes"), { wrapper });

    expect(result.current).toBeUndefined();
  });

  it("returns the change and a reset bound to that path", () => {
    const onResetField = vi.fn();
    const wrapper: FC<PropsWithChildren> = ({ children }) => (
      <FieldAnalysisProvider changeByPath={new Map([[change.path, change]])} onResetField={onResetField}>
        {children}
      </FieldAnalysisProvider>
    );

    const { result } = renderHook(() => useFieldAnalysis(change.path), { wrapper });
    result.current?.reset();

    expect(result.current?.change).toEqual(change);
    expect(onResetField).toHaveBeenCalledWith(change.path);
  });
});
