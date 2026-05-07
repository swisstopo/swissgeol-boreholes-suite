// @vitest-environment jsdom
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { AddEmptyStratigraphyDialog } from "./addEmptyStratigraphyDialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const { fetchApiV2WithApiError } = vi.hoisted(() => ({ fetchApiV2WithApiError: vi.fn() }));
vi.mock("../../../../api/fetchApiV2.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/fetchApiV2.ts")>("../../../../api/fetchApiV2.ts");
  return { ...actual, fetchApiV2WithApiError };
});

vi.mock("../../../../hooks/useResetTabStatus.ts", () => ({
  useResetTabStatus: () => () => {},
}));

const showApiErrorAlert = vi.fn();
vi.mock("../../../../hooks/useShowAlertOnError.tsx", () => ({
  useApiErrorAlert: () => showApiErrorAlert,
}));

const onClose = vi.fn();
const onCreated = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const renderDialog = (overrides: Partial<Parameters<typeof AddEmptyStratigraphyDialog>[0]> = {}) =>
  render(
    <AddEmptyStratigraphyDialog
      open
      onClose={onClose}
      boreholeId={42}
      isFirstStratigraphy={true}
      onCreated={onCreated}
      {...overrides}
    />,
    { wrapper: createWrapper() },
  );

const getNameInput = () => screen.getByRole("textbox");
const getSubmitButton = () => screen.getByRole("button", { name: /addemptystratigraphy/i });
const getCancelButton = () => screen.getByRole("button", { name: /cancel/i });

describe("AddEmptyStratigraphyDialog", () => {
  beforeEach(() => {
    showApiErrorAlert.mockReset();
    fetchApiV2WithApiError.mockReset();
    onClose.mockReset();
    onCreated.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("disables the submit button when the name is empty or whitespace", () => {
    renderDialog();
    expect((getSubmitButton() as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(getNameInput(), { target: { value: "   " } });
    expect((getSubmitButton() as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(getNameInput(), { target: { value: "Profile A" } });
    expect((getSubmitButton() as HTMLButtonElement).disabled).toBe(false);
  });

  it("submits the trimmed name with the expected payload and navigates on success", async () => {
    fetchApiV2WithApiError.mockResolvedValueOnce({ id: 99 });
    renderDialog({ boreholeId: 7, isFirstStratigraphy: true });

    fireEvent.change(getNameInput(), { target: { value: "  My Stratigraphy  " } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(fetchApiV2WithApiError).toHaveBeenCalledTimes(1));
    expect(fetchApiV2WithApiError).toHaveBeenCalledWith(
      "stratigraphy",
      "POST",
      expect.objectContaining({
        id: 0,
        boreholeId: 7,
        name: "My Stratigraphy",
        isPrimary: true,
        date: null,
      }),
    );

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(99));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sets isPrimary to false when not the first stratigraphy", async () => {
    fetchApiV2WithApiError.mockResolvedValueOnce({ id: 12 });
    renderDialog({ isFirstStratigraphy: false });

    fireEvent.change(getNameInput(), { target: { value: "Second" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(fetchApiV2WithApiError).toHaveBeenCalledTimes(1));
    expect(fetchApiV2WithApiError).toHaveBeenCalledWith(
      "stratigraphy",
      "POST",
      expect.objectContaining({ isPrimary: false }),
    );
  });

  it("shows an inline error and stays open when the name is not unique", async () => {
    fetchApiV2WithApiError.mockRejectedValueOnce(new ApiError("Name must be unique.", 500, "mustBeUnique"));
    renderDialog();

    fireEvent.change(getNameInput(), { target: { value: "Duplicate" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(screen.getByText("mustBeUnique")).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(showApiErrorAlert).not.toHaveBeenCalled();
  });

  it("clears the inline error when the user edits the name", async () => {
    fetchApiV2WithApiError.mockRejectedValueOnce(new ApiError("Name must be unique.", 500, "mustBeUnique"));
    renderDialog();

    fireEvent.change(getNameInput(), { target: { value: "Duplicate" } });
    fireEvent.click(getSubmitButton());
    await waitFor(() => expect(screen.getByText("mustBeUnique")).toBeTruthy());

    fireEvent.change(getNameInput(), { target: { value: "Different" } });
    await waitFor(() => expect(screen.queryByText("mustBeUnique")).toBeNull());
  });

  it("delegates other API errors to the alert hook", async () => {
    const error = new ApiError("Server exploded.", 500);
    fetchApiV2WithApiError.mockRejectedValueOnce(error);
    renderDialog();

    fireEvent.change(getNameInput(), { target: { value: "Whatever" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(showApiErrorAlert).toHaveBeenCalledWith(error));
    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("cancels without triggering the mutation", () => {
    renderDialog();

    fireEvent.change(getNameInput(), { target: { value: "Throwaway" } });
    fireEvent.click(getCancelButton());

    expect(fetchApiV2WithApiError).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
