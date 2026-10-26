// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { User, Workgroup } from "../../../../api/generated";
import { AddWorkgroupRoleDialog } from "./addWorkgroupRoleDialog.tsx";
import { checkOptions, chooseRole, openSelect } from "./roleAssignmentDialogTestHelpers.ts";

const { setWorkgroupRoles } = vi.hoisted(() => ({ setWorkgroupRoles: vi.fn() }));

const workgroups: Workgroup[] = [
  { id: 1, name: "Default", isDisabled: false },
  { id: 2, name: "Reggae", isDisabled: true },
  { id: 3, name: "World", isDisabled: false },
  { id: 4, name: "Blues", isDisabled: false },
];

const user: User = {
  id: 7,
  firstName: "Deletable",
  lastName: "User",
  workgroupRoles: [{ userId: 7, workgroupId: 1, role: "Publisher" }],
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../../../api/workgroup.ts", () => ({
  workgroupQueryKey: "workgroups",
  useWorkgroups: () => ({ data: workgroups }),
  useWorkgroupMutations: () => ({ setWorkgroupRoles: { mutate: setWorkgroupRoles } }),
}));

const renderDialog = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AddWorkgroupRoleDialog open={true} setOpen={vi.fn()} user={user} />
    </QueryClientProvider>,
  );

describe("AddWorkgroupRoleDialog", () => {
  afterEach(() => {
    cleanup();
    setWorkgroupRoles.mockClear();
  });

  it("offers only active workgroups in which the user has no role", () => {
    renderDialog();

    openSelect("workgroup-formSelect");

    const options = screen.getAllByRole("option").map(option => option.textContent);
    expect(options).toEqual(["selectAll", "World", "Blues"]);
  });

  it("adds the user to every checked workgroup with the chosen role in one request", () => {
    renderDialog();

    checkOptions("workgroup-formSelect", ["selectAll"]);
    chooseRole("Editor");
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(setWorkgroupRoles).toHaveBeenCalledExactlyOnceWith([
      { userId: 7, workgroupId: 3, role: "Editor", isActive: true },
      { userId: 7, workgroupId: 4, role: "Editor", isActive: true },
    ]);
  });
});
