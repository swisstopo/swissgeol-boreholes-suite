// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from "react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Borehole, User, UserWorkgroupRole } from "../../../../api/generated";
import { WorkflowRoute } from "./workflowRoute.tsx";

const useCurrentUser =
  vi.fn<() => { data: Pick<User, "id" | "isAdmin" | "workgroupRoles"> | undefined; isLoading: boolean }>();
const useAuth = vi.fn<() => { anonymousModeEnabled: boolean }>();

vi.mock("../../../../api/user.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/user.ts")>("../../../../api/user.ts");
  return { ...actual, useCurrentUser: () => useCurrentUser() };
});

vi.mock("../../../../auth/useBoreholesAuth.tsx", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("./workflowView.tsx", () => ({
  WorkflowView: () => <div>status page</div>,
}));

const borehole: Borehole = { id: 42, workgroup: { id: 1, name: "Workgroup" } };

const givenUserWithRole = (role: UserWorkgroupRole["role"]) => {
  useCurrentUser.mockReturnValue({
    data: { id: 7, isAdmin: false, workgroupRoles: [{ userId: 7, workgroupId: 1, role }] },
    isLoading: false,
  });
};

const renderStatusRoute = () =>
  render(
    <MemoryRouter initialEntries={["/42/status"]}>
      <Routes>
        <Route path="/42/status" element={<WorkflowRoute borehole={borehole} />} />
        <Route path="/42/location" element={<div>location page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("WorkflowRoute", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ anonymousModeEnabled: false });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it.each(["Editor", "Reviewer", "Publisher"] as const)("shows the status page to %ss of the workgroup", role => {
    givenUserWithRole(role);

    renderStatusRoute();

    expect(screen.getByText("status page")).toBeDefined();
  });

  it("sends readers of the workgroup to the location page", () => {
    givenUserWithRole("Reader");

    renderStatusRoute();

    expect(screen.getByText("location page")).toBeDefined();
  });

  it("sends anonymous users to the location page, whatever role the anonymous user holds", () => {
    useAuth.mockReturnValue({ anonymousModeEnabled: true });
    givenUserWithRole("Editor");

    renderStatusRoute();

    expect(screen.getByText("location page")).toBeDefined();
  });

  it("waits for the current user before deciding", () => {
    useCurrentUser.mockReturnValue({ data: undefined, isLoading: true });

    renderStatusRoute();

    expect(screen.queryByText("status page")).toBeNull();
    expect(screen.queryByText("location page")).toBeNull();
  });
});
