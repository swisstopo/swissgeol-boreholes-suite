// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../../api/generated";
import { AddUserDialog } from "./addUserDialog.tsx";
import { openSelect } from "./roleAssignmentDialogTestHelpers.ts";

const users: User[] = [
  { id: 1, firstName: "Active", lastName: "User", isDisabled: false },
  { id: 2, firstName: "Inactive", lastName: "User", isDisabled: true },
];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../../../api/user.ts", () => ({
  usersQueryKey: "users",
  useUsers: () => ({ data: users }),
}));

vi.mock("../../../../api/workgroup.ts", () => ({
  useWorkgroupMutations: () => ({ setWorkgroupRoles: { mutate: vi.fn() } }),
}));

describe("AddUserDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers only active users", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AddUserDialog open={true} setOpen={vi.fn()} workgroupId={1} />
      </QueryClientProvider>,
    );

    openSelect("user-formSelect");

    const options = screen.getAllByRole("option").map(option => option.textContent);
    expect(options).toEqual(["selectAll", "Active User"]);
  });
});
