// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("custom action without onClick calls onClose", () => {
    const onClose = vi.fn();
    render(
      <FormDialog open={true} title="Test" onClose={onClose} actions={[{ label: "close" }]}>
        <div />
      </FormDialog>,
    );

    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("custom action calls onClose once its onClick resolves to true", async () => {
    const onClose = vi.fn();
    const outcome = Promise.resolve(true);
    const onClick = vi.fn(() => outcome);
    render(
      <FormDialog open={true} title="Test" onClose={onClose} actions={[{ label: "save", onClick }]}>
        <div />
      </FormDialog>,
    );

    fireEvent.click(screen.getByText("Save"));
    await act(() => outcome);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("custom action keeps the dialog open when its onClick resolves to false", async () => {
    const onClose = vi.fn();
    const outcome = Promise.resolve(false);
    const onClick = vi.fn(() => outcome);
    render(
      <FormDialog open={true} title="Test" onClose={onClose} actions={[{ label: "save", onClick }]}>
        <div />
      </FormDialog>,
    );

    fireEvent.click(screen.getByText("Save"));
    await act(() => outcome);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });
});
