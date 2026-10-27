// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../../api/generated";
import { AddUserDialog } from "./addUserDialog.tsx";

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
  useWorkgroupMutations: () => ({ setWorkgroupRole: { mutate: vi.fn() } }),
}));

const openUserSelect = () => {
  const userSelect = document.querySelector<HTMLElement>('[data-cy="user-formSelect"]');
  if (!userSelect) throw new Error("The user select is not rendered.");
  fireEvent.mouseDown(within(userSelect).getByRole("combobox"));
};

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

    openUserSelect();

    const options = screen.getAllByRole("option").map(option => option.textContent);
    expect(options).toEqual(["Active User"]);
  });
});
