// @vitest-environment jsdom
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/errorClasses.ts";
import type { Borehole } from "../../api/generated";
import DetailHeader from "./detailHeader.tsx";
import { EditStateContext } from "./editStateContext.tsx";
import { SaveContext, SaveContextProps } from "./saveContext.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const lockMutateAsync = vi.fn();
const unlockMutateAsync = vi.fn();

vi.mock("../../api/borehole.ts", async () => {
  const actual = await vi.importActual<typeof import("../../api/borehole.ts")>("../../api/borehole.ts");
  return {
    ...actual,
    useBoreholeMutations: () => ({
      lock: { mutateAsync: lockMutateAsync },
      unlock: { mutateAsync: unlockMutateAsync },
      delete: { mutate: vi.fn() },
    }),
    useBoreholeEditable: () => ({ data: true }),
  };
});

vi.mock("../../hooks/useBoreholesNavigate.tsx", () => ({
  useBoreholesNavigate: () => ({ navigateTo: vi.fn() }),
}));

vi.mock("../../hooks/useRequiredId.ts", () => ({
  useRequiredId: () => 42,
}));

vi.mock("../../auth/useBoreholesAuth.tsx", () => ({
  useAuth: () => ({ anonymousModeEnabled: false }),
}));

// StatusBadges and ExportDialog pull in their own contexts (workflow mutation, AlertContext); they're
// out of scope for this test and are stubbed so the header can render without those providers.
vi.mock("./statusBadges.tsx", () => ({ StatusBadges: () => null }));
vi.mock("../../components/export/exportDialog.tsx", () => ({ ExportDialog: () => null }));

const borehole = {
  id: 42,
  name: "Test",
  originalName: "TB",
  workflow: { status: 0 },
  updated: null,
  updatedBy: null,
} as unknown as Borehole;

const setEditingEnabled = vi.fn();

const saveContext: SaveContextProps = {
  showSaveBar: false,
  showSaveFeedback: false,
  hasChanges: false,
  hasErrors: false,
  isSaving: false,
  setHasChanges: vi.fn(),
  setHasErrors: vi.fn(),
  registerSaveHandler: vi.fn(),
  triggerSave: vi.fn(),
  registerResetHandler: vi.fn(),
  triggerReset: vi.fn(),
  unMount: vi.fn(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <EditStateContext.Provider value={{ editingEnabled: false, setEditingEnabled }}>
        <SaveContext.Provider value={saveContext}>{children}</SaveContext.Provider>
      </EditStateContext.Provider>
    </QueryClientProvider>
  );
};

describe("DetailHeader lock/unlock error handling", () => {
  beforeEach(() => {
    lockMutateAsync.mockReset();
    unlockMutateAsync.mockReset();
    setEditingEnabled.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not flip editingEnabled when the lock mutation rejects", async () => {
    lockMutateAsync.mockRejectedValueOnce(new ApiError("gone", 404));
    render(<DetailHeader borehole={borehole} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => expect(lockMutateAsync).toHaveBeenCalledWith(42));
    expect(setEditingEnabled).not.toHaveBeenCalled();
  });

  it("flips editingEnabled when the lock mutation resolves", async () => {
    lockMutateAsync.mockResolvedValueOnce(undefined);
    render(<DetailHeader borehole={borehole} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => expect(setEditingEnabled).toHaveBeenCalledWith(true));
    expect(lockMutateAsync).toHaveBeenCalledWith(42);
  });
});
