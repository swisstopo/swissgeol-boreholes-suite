// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

const dialog = (open: boolean, addEntities: (ids: number[], role: Role) => void, dialogOptions = options) => (
  <QueryClientProvider client={queryClient}>
    <RoleAssignmentDialog
      open={open}
      setOpen={vi.fn()}
      addEntities={addEntities}
      entityType={EntityType.user}
      options={dialogOptions}
      entityQueryKey="users"
    />
  </QueryClientProvider>
);

const getCheckbox = (name: string) =>
  within(screen.getByRole("option", { name })).getByRole<HTMLInputElement>("checkbox");

describe("RoleAssignmentDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists Select all first, then every option", () => {
    render(dialog(true, vi.fn()));

    openSelect("user-formSelect");

    const names = screen.getAllByRole("option").map(option => option.textContent);
    expect(names).toEqual(["selectAll", "Ada Lovelace", "Alan Turing", "Grace Hopper"]);
  });

  it("checks every option with Select all and unchecks them with a second click", () => {
    render(dialog(true, vi.fn()));
    openSelect("user-formSelect");

    fireEvent.click(screen.getByRole("option", { name: "selectAll" }));

    expect(getCheckbox("selectAll").checked).toBe(true);
    expect(options.map(option => getCheckbox(option.label).checked)).toEqual([true, true, true]);

    fireEvent.click(screen.getByRole("option", { name: "selectAll" }));

    expect(getCheckbox("selectAll").checked).toBe(false);
    expect(options.map(option => getCheckbox(option.label).checked)).toEqual([false, false, false]);
  });

  it("shows Select all as indeterminate while only some options are checked", () => {
    render(dialog(true, vi.fn()));
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
    render(dialog(true, vi.fn()));
    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeDisabled();

    checkOptions("user-formSelect", ["Ada Lovelace"]);
    expect(addButton).toBeDisabled();

    chooseRole("Editor");
    expect(addButton).toBeEnabled();
  });

  it("adds every checked option with the chosen role in one call", () => {
    const addEntities = vi.fn();
    render(dialog(true, addEntities));

    checkOptions("user-formSelect", ["Ada Lovelace", "Grace Hopper"]);
    chooseRole("Editor");
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(addEntities).toHaveBeenCalledExactlyOnceWith([1, 3], "Editor");
  });

  it("shows no options and no Select all when there is nothing to add", () => {
    render(dialog(true, vi.fn(), []));

    openSelect("user-formSelect");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("starts without checked options after cancelling", () => {
    const { rerender } = render(dialog(true, vi.fn()));
    checkOptions("user-formSelect", ["Ada Lovelace"]);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    rerender(dialog(false, vi.fn()));
    rerender(dialog(true, vi.fn()));
    openSelect("user-formSelect");

    expect(getCheckbox("Ada Lovelace").checked).toBe(false);
  });
});
