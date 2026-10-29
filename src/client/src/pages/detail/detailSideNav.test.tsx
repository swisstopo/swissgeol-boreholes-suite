// @vitest-environment jsdom
import { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Borehole, User, UserWorkgroupRole } from "../../api/generated";
import { DetailSideNav } from "./detailSideNav.tsx";

const useCurrentUser = vi.fn<() => { data: Pick<User, "id" | "isAdmin" | "workgroupRoles">; isLoading: boolean }>();
const useAuth = vi.fn<() => { anonymousModeEnabled: boolean }>();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The real menu item is a web component that jsdom cannot render.
vi.mock("@swissgeol/ui-core-react", () => ({
  SgcMenuItem: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../../api/user.ts", async () => {
  const actual = await vi.importActual<typeof import("../../api/user.ts")>("../../api/user.ts");
  return { ...actual, useCurrentUser: () => useCurrentUser() };
});

vi.mock("../../auth/useBoreholesAuth.tsx", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("../../hooks/useBoreholeDataAvailability.ts", () => ({
  useBoreholeDataAvailability: () => ({}),
}));

vi.mock("../../hooks/useBoreholesNavigate.tsx", () => ({
  useBoreholesNavigate: () => ({ navigateTo: vi.fn() }),
}));

vi.mock("../../hooks/useRequiredId.ts", () => ({
  useRequiredId: () => 42,
}));

// The side nav only renders once the borehole has a workflow; its status is irrelevant here.
const borehole: Borehole = {
  id: 42,
  workgroup: { id: 1, name: "Workgroup" },
  workflow: { id: 1, boreholeId: 42, reviewedTabsId: 1, publishedTabsId: 1, status: "Reviewed" },
};

const givenUserWithRole = (role: UserWorkgroupRole["role"]) => {
  useCurrentUser.mockReturnValue({
    data: { id: 7, isAdmin: false, workgroupRoles: [{ userId: 7, workgroupId: 1, role }] },
    isLoading: false,
  });
};

const renderSideNav = () =>
  render(
    <MemoryRouter initialEntries={["/42/location"]}>
      <DetailSideNav borehole={borehole} />
    </MemoryRouter>,
  );

const queryStatusMenuItem = () => screen.queryByRole("button", { name: "Status" });

describe("DetailSideNav status menu item", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ anonymousModeEnabled: false });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("is shown to editors of the workgroup, also in a status they cannot change", () => {
    givenUserWithRole("Editor");

    renderSideNav();

    expect(queryStatusMenuItem()).not.toBeNull();
  });

  it("is hidden from readers of the workgroup", () => {
    givenUserWithRole("Reader");

    renderSideNav();

    expect(queryStatusMenuItem()).toBeNull();
    expect(screen.getByRole("button", { name: "Location" })).toBeDefined();
  });

  it("is hidden in anonymous mode, whatever role the anonymous user holds", () => {
    useAuth.mockReturnValue({ anonymousModeEnabled: true });
    givenUserWithRole("Editor");

    renderSideNav();

    expect(queryStatusMenuItem()).toBeNull();
  });
});
