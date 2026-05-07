// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormDialog } from "./formDialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key.charAt(0).toUpperCase() + key.slice(1),
  }),
}));

describe("FormDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Cancel and Apply buttons by default", () => {
    render(
      <FormDialog open={true} title="Test" onClose={vi.fn()}>
        <div />
      </FormDialog>,
    );

    expect(screen.getByText("Cancel")).toBeDefined();
    expect(screen.getByText("Apply")).toBeDefined();
  });

  it("Disables Apply but keeps Cancel enabled when isApplyDisabled is true", () => {
    render(
      <FormDialog open={true} title="Test" onClose={vi.fn()} isApplyDisabled={true}>
        <div />
      </FormDialog>,
    );

    expect(screen.getByText("Cancel").closest("button")?.disabled).toBe(false);
    expect(screen.getByText("Apply").closest("button")?.disabled).toBe(true);
  });

  it("Apply button is enabled when isApplyDisabled is false", () => {
    render(
      <FormDialog open={true} title="Test" onClose={vi.fn()}>
        <div />
      </FormDialog>,
    );

    const applyButton = screen.getByText("Apply").closest("button");
    expect(applyButton?.disabled).toBe(false);
  });

  it("Cancel calls onClose", () => {
    const onClose = vi.fn();
    const onApply = vi.fn();
    render(
      <FormDialog open={true} title="Test" onClose={onClose} onApply={onApply}>
        <div />
      </FormDialog>,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("Apply calls onApply", () => {
    const onClose = vi.fn();
    const onApply = vi.fn();
    render(
      <FormDialog open={true} title="Test" onClose={onClose} onApply={onApply}>
        <div />
      </FormDialog>,
    );

    fireEvent.click(screen.getByText("Apply"));
    expect(onApply).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders custom actions when actions prop is provided", () => {
    render(
      <FormDialog open={true} title="Test" onClose={vi.fn()} actions={[{ label: "custom1" }, { label: "custom2" }]}>
        <div />
      </FormDialog>,
    );

    expect(screen.getByText("Custom1")).toBeDefined();
    expect(screen.getByText("Custom2")).toBeDefined();
    expect(screen.queryByText("Cancel")).toBeNull();
    expect(screen.queryByText("Apply")).toBeNull();
  });
});
