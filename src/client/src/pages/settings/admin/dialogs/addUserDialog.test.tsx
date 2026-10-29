// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../../api/generated";
import { AddUserDialog } from "./addUserDialog.tsx";
import { checkOptions, chooseRole, openSelect } from "./roleAssignmentDialogTestHelpers.ts";

const { setWorkgroupRoles } = vi.hoisted(() => ({
  setWorkgroupRoles: vi.fn<(changes: unknown[], options: { onSuccess: () => void }) => void>(),
}));

const users: User[] = [
  { id: 1, firstName: "Active", lastName: "User", isDisabled: false },
  { id: 2, firstName: "Inactive", lastName: "User", isDisabled: true },
  {
    id: 3,
    firstName: "Member",
    lastName: "User",
    isDisabled: false,
    workgroupRoles: [{ userId: 3, workgroupId: 1, role: "Editor" }],
  },
  {
    id: 4,
    firstName: "Other",
    lastName: "Member",
    isDisabled: false,
    workgroupRoles: [{ userId: 4, workgroupId: 2, role: "Editor" }],
  },
];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../../../api/user.ts", () => ({
  usersQueryKey: "users",
  useUsers: () => ({ data: users }),
}));

vi.mock("../../../../api/workgroup.ts", () => ({
  useWorkgroupMutations: () => ({ setWorkgroupRoles: { mutate: setWorkgroupRoles, isPending: false } }),
}));

const renderDialog = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AddUserDialog open={true} setOpen={vi.fn()} workgroupId={1} />
    </QueryClientProvider>,
  );

describe("AddUserDialog", () => {
  afterEach(() => {
    cleanup();
    setWorkgroupRoles.mockClear();
  });

  it("offers only active users without a role in the workgroup", () => {
    renderDialog();

    openSelect("user-formSelect");

    const options = screen.getAllByRole("option").map(option => option.textContent);
    expect(options).toEqual(["selectAll", "Active User", "Other Member"]);
  });

  it("adds every checked user with the chosen role in one request", () => {
    renderDialog();

    checkOptions("user-formSelect", ["Active User", "Other Member"]);
    chooseRole("Reader");
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(setWorkgroupRoles).toHaveBeenCalledOnce();
    expect(setWorkgroupRoles.mock.calls[0][0]).toEqual([
      { userId: 1, workgroupId: 1, role: "Reader", isActive: true },
      { userId: 4, workgroupId: 1, role: "Reader", isActive: true },
    ]);
  });
});
