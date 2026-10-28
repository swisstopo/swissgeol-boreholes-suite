// @vitest-environment jsdom
import { WorkflowStatus } from "@swissgeol/ui-core";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { User, UserWorkgroupRole } from "../../../../api/generated";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { AlertContextInterface } from "../../../../components/alert/alertInterfaces.ts";
import { restrictionFreeCode } from "../../../../components/codelist.ts";
import { WorkflowChangeRequest } from "./workflow.ts";
import { WorkflowView } from "./workflowView.tsx";

// Only the props the tests inspect; the real SgcWorkflow is a web component that jsdom cannot render.
interface CapturedWorkflowProps {
  isReadOnly: boolean;
  canChangeStatus: boolean;
  isRestricted: boolean;
  onSgcWorkflowChange: (event: { detail: { changes: { toStatus: WorkflowStatus } } }) => void;
}

interface ManagePermissionResult {
  data: boolean | undefined;
}

const sgcWorkflow = vi.fn<(props: CapturedWorkflowProps) => null>(() => null);
const useCurrentUser = vi.fn<() => { data: Pick<User, "id" | "isAdmin" | "workgroupRoles">; isLoading: boolean }>();
const useBoreholeManageable =
  vi.fn<
    () => ManagePermissionResult & { refetch: (options: { cancelRefetch: boolean }) => Promise<ManagePermissionResult> }
  >();
const updateWorkflow = vi.fn<(request: WorkflowChangeRequest, options?: { onSuccess?: () => void }) => void>();
const showAlert = vi.fn<AlertContextInterface["showAlert"]>();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@swissgeol/ui-core-react", () => ({
  SgcWorkflow: (props: CapturedWorkflowProps) => sgcWorkflow(props),
}));

vi.mock("../../../../api/borehole.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/borehole.ts")>("../../../../api/borehole.ts");
  return {
    ...actual,
    useBorehole: () => ({ data: { id: 42, workgroup: { id: 1 }, restrictionId: restrictionFreeCode } }),
    useBoreholeManageable: () => useBoreholeManageable(),
  };
});

vi.mock("../../../../api/user.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/user.ts")>("../../../../api/user.ts");
  return {
    ...actual,
    useCurrentUser: () => useCurrentUser(),
    useEditorUsersOnWorkgroup: () => ({ data: [] }),
  };
});

vi.mock("./workflow.ts", async () => {
  const actual = await vi.importActual<typeof import("./workflow.ts")>("./workflow.ts");
  return {
    ...actual,
    useWorkflow: () => ({
      data: {
        id: 1,
        boreholeId: 42,
        status: "InReview",
        reviewedTabs: { general: true },
        publishedTabs: { general: true },
        changes: [],
      },
      isLoading: false,
    }),
    useWorkflowMutation: () => ({
      updateWorkflow: { mutate: updateWorkflow },
      updateTabStatus: { mutate: vi.fn() },
    }),
  };
});

vi.mock("../../../../hooks/useBoreholeDataAvailability.ts", () => ({
  useBoreholeDataAvailability: () => ({}),
}));

vi.mock("../../../../hooks/useRequiredId.ts", () => ({
  useRequiredId: () => 42,
}));

const givenUserWithRole = (role: UserWorkgroupRole["role"]) => {
  useCurrentUser.mockReturnValue({
    data: { id: 7, isAdmin: false, workgroupRoles: [{ userId: 7, workgroupId: 1, role }] },
    isLoading: false,
  });
};

const givenManagePermission = (canManage: boolean | undefined, canManageAfterRefetch = canManage) => {
  const refetch = vi
    .fn<(options: { cancelRefetch: boolean }) => Promise<ManagePermissionResult>>()
    .mockResolvedValue({ data: canManageAfterRefetch });
  useBoreholeManageable.mockReturnValue({ data: canManage, refetch });
  return refetch;
};

const renderStatusPage = () =>
  render(
    <AlertContext.Provider value={{ alertIsOpen: false, text: undefined, showAlert, closeAlert: vi.fn() }}>
      <WorkflowView />
    </AlertContext.Provider>,
  );

// A macrotask runs only after every pending promise continuation, however many awaits the component chains.
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

const getWorkflowProps = (): CapturedWorkflowProps | undefined => sgcWorkflow.mock.lastCall?.[0];

const requestReviewAndSucceed = () => {
  getWorkflowProps()?.onSgcWorkflowChange({ detail: { changes: { toStatus: WorkflowStatus.InReview } } });
  updateWorkflow.mock.lastCall?.[1]?.onSuccess?.();
};

describe("WorkflowView", () => {
  beforeEach(() => {
    givenUserWithRole("Editor");
    givenManagePermission(true);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the status read-only to editors who cannot manage the borehole in its status", () => {
    givenManagePermission(false);

    renderStatusPage();

    expect(getWorkflowProps()).toMatchObject({ isReadOnly: true, canChangeStatus: false });
  });

  it("keeps the status read-only while the manage permission is loading", () => {
    givenManagePermission(undefined);

    renderStatusPage();

    expect(getWorkflowProps()).toMatchObject({ isReadOnly: true, canChangeStatus: false });
  });

  it("lets users who can manage the borehole change the status", () => {
    renderStatusPage();

    expect(getWorkflowProps()).toMatchObject({ isReadOnly: false, canChangeStatus: true });
  });

  it("greys out publishing for users who are not publishers in the workgroup", () => {
    renderStatusPage();

    expect(getWorkflowProps()?.isRestricted).toBe(true);
  });

  it("allows publishers of the workgroup to publish", () => {
    givenUserWithRole("Publisher");

    renderStatusPage();

    expect(getWorkflowProps()?.isRestricted).toBe(false);
  });

  it("announces when the own status change takes away the manage permission", async () => {
    givenManagePermission(true, false);
    renderStatusPage();

    requestReviewAndSucceed();

    await waitFor(() => expect(showAlert).toHaveBeenCalledWith("boreholeStatusChangedNoMorePermissions", "success"));
  });

  it("stays silent when the user can still manage the borehole after the status change", async () => {
    const refetch = givenManagePermission(true, true);
    renderStatusPage();

    requestReviewAndSucceed();

    await flushPromises();
    expect(refetch).toHaveBeenCalledWith({ cancelRefetch: false });
    expect(showAlert).not.toHaveBeenCalled();
  });
});
