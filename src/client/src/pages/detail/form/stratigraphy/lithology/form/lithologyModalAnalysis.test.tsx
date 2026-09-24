// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { ShowPrompt } from "../../../../../../components/prompt/promptInterface.ts";
import { LithologyAnalysis } from "../analysis/useLithologyAnalysis.ts";
import { buildApplyHandler } from "./lithologyUtils.ts";

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
