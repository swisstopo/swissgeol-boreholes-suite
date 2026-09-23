// @vitest-environment jsdom
import { Dispatch, SetStateAction } from "react";
import { ThemeProvider } from "@mui/material";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setFileSizeLimits } from "../../../../api/fileSize.ts";
import { theme } from "../../../../AppTheme.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { ImportPanel } from "./importPanel.tsx";

const importBoreholeArchive = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("../../../../api/borehole.ts", () => ({
  BoreholeImportError: class extends Error {},
  boreholeQueryKey: "boreholes",
  importBoreholesCsv: vi.fn(),
  importBoreholesJson: vi.fn(),
}));

vi.mock("../../../../api/download.ts", () => ({ downloadCodelistCsv: vi.fn() }));

vi.mock("../../../../api/fetchApiV2.ts", () => ({ isJsonContentType: () => false }));

vi.mock("../../../../api/zipArchive.ts", () => ({ ArchiveJsonMissingError: class extends Error {} }));

vi.mock("../../UserWorkgroupsContext.tsx", () => ({
  useUserWorkgroups: () => ({
    editableWorkgroups: [{ id: 1, name: "Default" }],
    currentWorkgroupId: 1,
    setCurrentWorkgroupId: vi.fn(),
  }),
}));

vi.mock("../commons/workgroupSelect.tsx", () => ({ default: () => null }));

vi.mock("./boreholeImport.ts", () => ({ importBoreholeArchive }));

// Stands in for the dropzone, so a test can hand the panel the archive a user would have dropped.
vi.mock("./boreholeImportDropzone.tsx", () => ({
  BoreholeImportDropzone: ({ setFile }: { setFile: Dispatch<SetStateAction<File | null>> }) => (
    <button onClick={() => setFile(new File(["zip"], "export.zip", { type: "application/zip" }))}>pick archive</button>
  ),
}));

const showAlert = vi.fn();

const renderPanel = () =>
  render(
    <ThemeProvider theme={theme}>
      <AlertContext.Provider value={{ alertIsOpen: false, text: undefined, showAlert, closeAlert: vi.fn() }}>
        <ImportPanel toggleDrawer={vi.fn()} setErrorsResponse={vi.fn()} setErrorDialogOpen={vi.fn()} />
      </AlertContext.Provider>
    </ThemeProvider>,
  );

const importButton = () => screen.getByRole<HTMLButtonElement>("button", { name: "import" });

describe("ImportPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setFileSizeLimits({ maxFileSize: 1000, largeMaxFileSize: 1000, maxImportArchiveSize: 1_000_000, chunkSize: 1000 });
  });

  afterEach(() => {
    cleanup();
  });

  it("starts no second import while one is running", async () => {
    let finishImport = () => {};
    importBoreholeArchive.mockImplementation(
      () =>
        new Promise(resolve => {
          finishImport = () => resolve({ boreholeCount: 1, uploadedCount: 1, pendingCount: 0 });
        }),
    );

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "pick archive" }));
    fireEvent.click(importButton());
    await waitFor(() => expect(importBoreholeArchive).toHaveBeenCalledTimes(1));

    expect(importButton().disabled).toBe(true);
    fireEvent.click(importButton());
    expect(importBoreholeArchive).toHaveBeenCalledTimes(1);

    finishImport();
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith("1 boreholesImported.", "success"));
    expect(importBoreholeArchive).toHaveBeenCalledTimes(1);
  });
});
