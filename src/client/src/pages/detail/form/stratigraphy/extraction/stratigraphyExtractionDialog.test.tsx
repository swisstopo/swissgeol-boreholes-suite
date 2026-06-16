// @vitest-environment jsdom
import { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtractedStratigraphy } from "../../../../../api/dataextraction.ts";
import { ApiError } from "../../../../../api/errorClasses.ts";
import { BoreholeAttachment } from "../../../../../api/unionTypes.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
import { AlertContextInterface } from "../../../../../components/alert/alertInterfaces.ts";
import { StratigraphyExtractionDialog } from "./stratigraphyExtractionDialog.tsx";
import { StratigraphyExtractionViewProps } from "./stratigraphyExtractionView.tsx";

// The codebase tags elements with data-cy; map Testing Library's getByTestId to it.
configure({ testIdAttribute: "data-cy" });

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router", () => ({
  useLocation: () => ({ hash: "" }),
  useParams: () => ({ id: "42" }),
}));

// Drives what the dialog sees as extracted stratigraphies; mutated per test before render.
const extractionState: { data: ExtractedStratigraphy[]; isLoading: boolean } = { data: [], isLoading: false };
vi.mock("../../../../../api/dataextraction.ts", () => ({
  useExtractStratigraphies: () => extractionState,
  useFileInfo: () => ({ isLoading: false }),
}));

const bulkAdd = vi.fn();
vi.mock("../stratigraphy.ts", () => ({
  useAddExtractedStratigraphies: () => ({ mutateAsync: bulkAdd, isPending: false }),
}));

const navigateTo = vi.fn();
vi.mock("../../../../../hooks/useBoreholesNavigate.tsx", () => ({
  useBoreholesNavigate: () => ({ navigateTo }),
}));

// Lightweight stand-in for the heavy extraction view (maps, canvas, lithology table).
// It only surfaces the name field and inline error per stratigraphy so we can exercise
// the dialog's name prefill, validation and submit logic in isolation.
vi.mock("./stratigraphyExtractionView.tsx", () => ({
  StratigraphyExtractionView: ({
    allExtractedStratigraphies,
    names,
    nameErrors,
    onNameChange,
  }: StratigraphyExtractionViewProps) => (
    <div>
      {allExtractedStratigraphies.map((_, index) => (
        <div key={index}>
          <input
            aria-label={`name-input-${index}`}
            value={names.get(index) ?? ""}
            onChange={event => onNameChange(index, event.target.value)}
          />
          <span aria-label={`name-error-${index}`}>{nameErrors.get(index) ?? ""}</span>
        </div>
      ))}
    </div>
  ),
}));

const showAlert = vi.fn();
const setSelectedFile = vi.fn();
const setOpen = vi.fn();

const alertValue: AlertContextInterface = {
  alertIsOpen: false,
  text: undefined,
  showAlert,
  closeAlert: () => {},
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AlertContext.Provider value={alertValue}>{children}</AlertContext.Provider>
    </QueryClientProvider>
  );
  return Wrapper;
};

const makeStratigraphy = (pageNumbers: number[]): ExtractedStratigraphy => ({ pageNumbers, descriptions: [] });

const renderDialog = (stratigraphies: ExtractedStratigraphy[], fileName = "profile.pdf") => {
  extractionState.data = stratigraphies;
  return render(
    <StratigraphyExtractionDialog
      file={{ id: 1, name: fileName, nameUuid: "uuid-1" } as BoreholeAttachment}
      setSelectedFile={setSelectedFile}
      open
      setOpen={setOpen}
    />,
    { wrapper: createWrapper() },
  );
};

const nameInput = (index: number) => screen.getByLabelText(`name-input-${index}`) as HTMLInputElement;
const nameError = (index: number) => screen.getByLabelText(`name-error-${index}`);
const addButton = () => screen.getByTestId("add-stratigraphy-button") as HTMLButtonElement;

describe("StratigraphyExtractionDialog", () => {
  beforeEach(() => {
    extractionState.data = [];
    bulkAdd.mockReset();
    navigateTo.mockReset();
    showAlert.mockReset();
    setSelectedFile.mockReset();
    setOpen.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("prefills a single stratigraphy with the file base name and no suffix", async () => {
    renderDialog([makeStratigraphy([1])]);
    await waitFor(() => expect(nameInput(0).value).toBe("profile"));
  });

  it("prefills multiple stratigraphies with a numbered suffix", async () => {
    renderDialog([makeStratigraphy([1]), makeStratigraphy([2])]);
    await waitFor(() => expect(nameInput(0).value).toBe("profile_1"));
    expect(nameInput(1).value).toBe("profile_2");
  });

  it("auto-checks the only stratigraphy and enables saving", async () => {
    renderDialog([makeStratigraphy([1])]);
    await waitFor(() => expect(addButton().disabled).toBe(false));
  });

  it("flags an empty name as required and disables saving", async () => {
    renderDialog([makeStratigraphy([1])]);
    await waitFor(() => expect(addButton().disabled).toBe(false));

    fireEvent.change(nameInput(0), { target: { value: "" } });

    await waitFor(() => expect(nameError(0).textContent).toBe("required"));
    expect(addButton().disabled).toBe(true);
  });

  it("treats whitespace-only names as empty", async () => {
    renderDialog([makeStratigraphy([1])]);
    fireEvent.change(nameInput(0), { target: { value: "   " } });

    await waitFor(() => expect(nameError(0).textContent).toBe("required"));
    expect(addButton().disabled).toBe(true);
  });

  it("flags duplicate names within the checked batch as not unique", async () => {
    renderDialog([makeStratigraphy([1]), makeStratigraphy([2])]);

    // Check stratigraphy 1 (selected by default), then switch to and check stratigraphy 2.
    fireEvent.click(screen.getByTestId("add-stratigraphy-checkbox-1").querySelector("input")!);
    fireEvent.click(screen.getByTestId("stratigraphy-toggle-item-1"));
    fireEvent.click(screen.getByTestId("add-stratigraphy-checkbox-2").querySelector("input")!);

    fireEvent.change(nameInput(0), { target: { value: "Same" } });
    fireEvent.change(nameInput(1), { target: { value: "Same" } });

    await waitFor(() => expect(nameError(0).textContent).toBe("mustBeUnique"));
    expect(nameError(1).textContent).toBe("mustBeUnique");
    expect(addButton().disabled).toBe(true);
  });

  it("submits trimmed names and navigates to the created stratigraphy on success", async () => {
    bulkAdd.mockResolvedValueOnce([{ stratigraphy: { id: 99, boreholeId: 42 } }]);
    renderDialog([makeStratigraphy([1])]);

    fireEvent.change(nameInput(0), { target: { value: "  Layer A  " } });
    await waitFor(() => expect(addButton().disabled).toBe(false));
    fireEvent.click(addButton());

    await waitFor(() => expect(bulkAdd).toHaveBeenCalledTimes(1));
    expect(bulkAdd).toHaveBeenCalledWith({
      boreholeId: 42,
      stratigraphies: [{ name: "Layer A", lithologicalDescriptions: [], lithologies: [] }],
    });

    await waitFor(() => expect(navigateTo).toHaveBeenCalledWith({ path: "/42/stratigraphy/99", hash: "" }));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("marks server-reported conflicting names and keeps the dialog open", async () => {
    bulkAdd.mockRejectedValueOnce(
      new ApiError("Name must be unique.", 409, "mustBeUnique", { conflictingNames: ["Dup"] }),
    );
    renderDialog([makeStratigraphy([1])]);

    fireEvent.change(nameInput(0), { target: { value: "Dup" } });
    await waitFor(() => expect(addButton().disabled).toBe(false));
    fireEvent.click(addButton());

    await waitFor(() => expect(nameError(0).textContent).toBe("mustBeUnique"));
    expect(addButton().disabled).toBe(true);
    expect(setOpen).not.toHaveBeenCalled();
    expect(showAlert).not.toHaveBeenCalled();
  });

  it("delegates non-uniqueness save errors to the alert", async () => {
    bulkAdd.mockRejectedValueOnce(new ApiError("Server exploded.", 500));
    renderDialog([makeStratigraphy([1])]);

    fireEvent.change(nameInput(0), { target: { value: "Layer A" } });
    await waitFor(() => expect(addButton().disabled).toBe(false));
    fireEvent.click(addButton());

    await waitFor(() => expect(showAlert).toHaveBeenCalledWith("errorStratigraphySaving", "error"));
    expect(setOpen).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
  });
});
