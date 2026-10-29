// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Role } from "../../../../api/generated";
import { EntityType } from "./entityType.ts";
import { EntityOption, RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";
import { checkOptions, chooseRole, openSelect } from "./roleAssignmentDialogTestHelpers.ts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const options: EntityOption[] = [
  { id: 1, label: "Ada Lovelace" },
  { id: 2, label: "Alan Turing" },
  { id: 3, label: "Grace Hopper" },
];

const queryClient = new QueryClient();

type AddEntities = (ids: number[], role: Role, onAdded: () => void) => void;

interface DialogSetup {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  addEntities?: AddEntities;
  isAdding?: boolean;
  dialogOptions?: EntityOption[];
}

const dialog = ({
  open = true,
  setOpen = vi.fn(),
  addEntities = vi.fn(),
  isAdding = false,
  dialogOptions = options,
}: DialogSetup = {}) => (
  <QueryClientProvider client={queryClient}>
    <RoleAssignmentDialog
      open={open}
      setOpen={setOpen}
      addEntities={addEntities}
      isAdding={isAdding}
      entityType={EntityType.user}
      options={dialogOptions}
      entityQueryKey="users"
    />
  </QueryClientProvider>
);

const addSelection = (names: string[]) => {
  checkOptions("user-formSelect", names);
  chooseRole("Editor");
  fireEvent.click(screen.getByRole("button", { name: /add/i }));
};

const getCheckbox = (name: string) =>
  within(screen.getByRole("option", { name })).getByRole<HTMLInputElement>("checkbox");

describe("RoleAssignmentDialog", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("lists Select all first, then every option", () => {
    render(dialog());

    openSelect("user-formSelect");

    const names = screen.getAllByRole("option").map(option => option.textContent);
    expect(names).toEqual(["selectAll", "Ada Lovelace", "Alan Turing", "Grace Hopper"]);
  });

  it("checks every option with Select all and unchecks them with a second click", () => {
    render(dialog());
    openSelect("user-formSelect");

    fireEvent.click(screen.getByRole("option", { name: "selectAll" }));

    expect(getCheckbox("selectAll").checked).toBe(true);
    expect(options.map(option => getCheckbox(option.label).checked)).toEqual([true, true, true]);

    fireEvent.click(screen.getByRole("option", { name: "selectAll" }));

    expect(getCheckbox("selectAll").checked).toBe(false);
    expect(options.map(option => getCheckbox(option.label).checked)).toEqual([false, false, false]);
  });

  it("shows Select all as indeterminate while only some options are checked", () => {
    render(dialog());
    openSelect("user-formSelect");

    fireEvent.click(screen.getByRole("option", { name: "Ada Lovelace" }));

    expect(getCheckbox("selectAll").checked).toBe(false);
    expect(getCheckbox("selectAll").dataset.indeterminate).toBe("true");

    fireEvent.click(screen.getByRole("option", { name: "Alan Turing" }));
    fireEvent.click(screen.getByRole("option", { name: "Grace Hopper" }));

    expect(getCheckbox("selectAll").checked).toBe(true);
    expect(getCheckbox("selectAll").dataset.indeterminate).toBe("false");
  });

  it("keeps Add disabled until an option and a role are chosen", () => {
    render(dialog());
    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeDisabled();

    checkOptions("user-formSelect", ["Ada Lovelace"]);
    expect(addButton).toBeDisabled();

    chooseRole("Editor");
    expect(addButton).toBeEnabled();
  });

  it("adds every checked option with the chosen role in one call", () => {
    const addEntities = vi.fn<AddEntities>();
    render(dialog({ addEntities }));

    addSelection(["Ada Lovelace", "Grace Hopper"]);

    expect(addEntities).toHaveBeenCalledOnce();
    expect(addEntities.mock.calls[0].slice(0, 2)).toEqual([[1, 3], "Editor"]);
  });

  it("closes only once the roles are saved", () => {
    const setOpen = vi.fn();
    const addEntities = vi.fn<AddEntities>();
    render(dialog({ setOpen, addEntities }));

    addSelection(["Ada Lovelace"]);
    expect(setOpen).not.toHaveBeenCalled();

    const onAdded = addEntities.mock.calls[0][2];
    act(() => onAdded());
    expect(setOpen).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("keeps the selection when the roles are not saved", () => {
    render(dialog({ addEntities: vi.fn<AddEntities>() }));

    addSelection(["Ada Lovelace"]);
    openSelect("user-formSelect");

    expect(getCheckbox("Ada Lovelace").checked).toBe(true);
  });

  it("disables Add while the roles are being saved", () => {
    render(dialog({ isAdding: true }));

    checkOptions("user-formSelect", ["Ada Lovelace"]);
    chooseRole("Editor");

    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("disables Cancel while the roles are being saved", () => {
    render(dialog({ isAdding: true }));

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("refetches the options each time it opens", () => {
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { rerender } = render(dialog({ open: false }));
    expect(invalidateQueries).not.toHaveBeenCalled();

    rerender(dialog());
    rerender(dialog({ open: false }));
    rerender(dialog());

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenLastCalledWith({ queryKey: ["users"] });
  });

  it("does not add a checked option that is no longer offered", () => {
    const addEntities = vi.fn<AddEntities>();
    const { rerender } = render(dialog({ addEntities }));
    checkOptions("user-formSelect", ["Ada Lovelace", "Grace Hopper"]);

    rerender(dialog({ addEntities, dialogOptions: options.slice(0, 2) }));
    chooseRole("Editor");
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(addEntities).toHaveBeenCalledOnce();
    expect(addEntities.mock.calls[0].slice(0, 2)).toEqual([[1], "Editor"]);
  });

  it("does not count a checked option that is no longer offered towards Select all", () => {
    const { rerender } = render(dialog());
    checkOptions("user-formSelect", ["Ada Lovelace", "Grace Hopper"]);

    rerender(dialog({ dialogOptions: options.slice(0, 2) }));
    openSelect("user-formSelect");

    expect(getCheckbox("selectAll").checked).toBe(false);
    expect(getCheckbox("selectAll").dataset.indeterminate).toBe("true");
  });

  it("shows no options and no Select all when there is nothing to add", () => {
    render(dialog({ dialogOptions: [] }));

    openSelect("user-formSelect");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("starts without checked options after cancelling", () => {
    const { rerender } = render(dialog());
    checkOptions("user-formSelect", ["Ada Lovelace"]);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    rerender(dialog({ open: false }));
    rerender(dialog());
    openSelect("user-formSelect");

    expect(getCheckbox("Ada Lovelace").checked).toBe(false);
  });
});
