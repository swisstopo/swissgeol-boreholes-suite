// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { AddEmptyStratigraphyDialog } from "./addEmptyStratigraphyDialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const invalidateQueries = vi.fn().mockResolvedValue(undefined);
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries }),
  };
});

const showApiErrorAlert = vi.fn();
vi.mock("../../../../hooks/useShowAlertOnError.tsx", () => ({
  useApiErrorAlert: () => showApiErrorAlert,
}));

const mutateAsync = vi.fn();
vi.mock("../../../../api/stratigraphy.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/stratigraphy.ts")>(
    "../../../../api/stratigraphy.ts",
  );
  return {
    ...actual,
    useStratigraphyMutations: () => ({
      add: { mutateAsync, isPending: false },
      copy: { mutateAsync: vi.fn() },
      update: { mutateAsync: vi.fn() },
      delete: { mutateAsync: vi.fn() },
    }),
  };
});

const onClose = vi.fn();
const onCreated = vi.fn();

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
  );

const getNameInput = () => screen.getByRole("textbox");
const getSubmitButton = () => screen.getByRole("button", { name: /addemptystratigraphy/i });
const getCancelButton = () => screen.getByRole("button", { name: /cancel/i });

describe("AddEmptyStratigraphyDialog", () => {
  beforeEach(() => {
    showApiErrorAlert.mockReset();
    mutateAsync.mockReset();
    invalidateQueries.mockClear();
    invalidateQueries.mockResolvedValue(undefined);
    onClose.mockReset();
    onCreated.mockReset();
  });

  afterEach(() => {
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
    mutateAsync.mockResolvedValue({ id: 99 });
    renderDialog({ boreholeId: 7, isFirstStratigraphy: true });

    fireEvent.change(getNameInput(), { target: { value: "  My Stratigraphy  " } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith(
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
    mutateAsync.mockResolvedValue({ id: 12 });
    renderDialog({ isFirstStratigraphy: false });

    fireEvent.change(getNameInput(), { target: { value: "Second" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ isPrimary: false }));
  });

  it("shows an inline error and stays open when the name is not unique", async () => {
    mutateAsync.mockRejectedValue(new ApiError("Name must be unique."));
    renderDialog();

    fireEvent.change(getNameInput(), { target: { value: "Duplicate" } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(screen.getByText("mustBeUnique")).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(showApiErrorAlert).not.toHaveBeenCalled();
  });

  it("delegates other API errors to the alert hook", async () => {
    const error = new ApiError("Server exploded.", 500);
    mutateAsync.mockRejectedValue(error);
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

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
