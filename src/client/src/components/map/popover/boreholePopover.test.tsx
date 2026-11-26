// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { legendSymbols } from "../legend/legendSymbols.ts";
import { BoreholePopover } from "./boreholePopover.tsx";
import { BoreholePopoverRow } from "./boreholePopoverRows.ts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
  }),
}));

vi.mock("../../codelist.ts", async () => {
  const actual = await vi.importActual<typeof import("../../codelist.ts")>("../../codelist.ts");
  return {
    ...actual,
    useCodelistDisplayValues: () => (id: number) => ({ text: `code ${id}`, code: "" }),
  };
});

const rowsOf = (count: number): BoreholePopoverRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Borehole ${index + 1}`,
    symbol: legendSymbols.purpleHexagon,
    legendLabel: { kind: "codelist", codelistId: 20101001 },
  }));

const renderPopover = (rows: BoreholePopoverRow[], pinned: boolean) => {
  const onHoverRow = vi.fn();
  const onOpenRow = vi.fn();
  render(<BoreholePopover rows={rows} pinned={pinned} onHoverRow={onHoverRow} onOpenRow={onOpenRow} />);
  return { onHoverRow, onOpenRow };
};

const chevronCount = () =>
  [...document.querySelectorAll(".borehole-popover-chevron")].filter(
    chevron => getComputedStyle(chevron).visibility !== "hidden",
  ).length;

describe("BoreholePopover", () => {
  afterEach(() => {
    cleanup();
  });

  it("previews a single borehole with its name and capitalized legend value, without chevron", () => {
    renderPopover(rowsOf(1), false);

    const row = screen.getByRole("listitem");
    expect(within(row).getByText("Borehole 1")).toBeTruthy();
    expect(within(row).getByText("Code 20101001")).toBeTruthy();
    expect(chevronCount()).toBe(0);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("previews several boreholes without chevrons", () => {
    renderPopover(rowsOf(3), false);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(chevronCount()).toBe(0);
  });

  it("previews four boreholes and the number of the others when there are more than five", () => {
    renderPopover(rowsOf(7), false);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[4].textContent).toBe("moreBoreholes:3");
  });

  it("lists all boreholes of a pinned popover as buttons with chevrons", () => {
    renderPopover(rowsOf(7), true);

    expect(screen.getByRole("region", { name: "mapPopoverBoreholes:7" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(chevronCount()).toBe(7);
  });

  it("keeps the popover element when a preview is pinned, so it does not appear again", () => {
    const rows = rowsOf(3);
    const props = { rows, onHoverRow: vi.fn(), onOpenRow: vi.fn() };
    const { container, rerender } = render(<BoreholePopover {...props} pinned={false} />);
    const preview = container.firstElementChild;

    rerender(<BoreholePopover {...props} pinned={true} />);

    expect(container.firstElementChild).toBe(preview);
  });

  it("reports the hovered row and opens the clicked one", () => {
    const { onHoverRow, onOpenRow } = renderPopover(rowsOf(2), true);
    const secondRow = screen.getByRole("button", { name: /Borehole 2/ });

    fireEvent.mouseEnter(secondRow);
    expect(onHoverRow).toHaveBeenLastCalledWith(2);

    fireEvent.mouseLeave(screen.getByRole("list"));
    expect(onHoverRow).toHaveBeenLastCalledWith(null);

    fireEvent.click(secondRow);
    expect(onOpenRow).toHaveBeenCalledWith(2);
  });

  it("reports the focused row and clears it when the focus leaves the row", () => {
    const { onHoverRow } = renderPopover(rowsOf(2), true);
    const firstRow = screen.getByRole("button", { name: /Borehole 1/ });

    fireEvent.focus(firstRow);
    expect(onHoverRow).toHaveBeenLastCalledWith(1);

    fireEvent.blur(firstRow);
    expect(onHoverRow).toHaveBeenLastCalledWith(null);
  });
});
