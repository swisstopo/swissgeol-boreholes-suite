// @vitest-environment jsdom
import { FileRejection } from "react-dropzone";
import { MemoryRouter } from "react-router";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PanelTab } from "../../../api/dataextractionInterfaces.ts";
import { setFileSizeLimits } from "../../../api/fileSize.ts";
import LabelingFileSelector from "./labelingFileSelector.tsx";

/** The part of the dropzone configuration the limits are read off. */
interface DropzoneOptions {
  maxSize: number;
  onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
}

const { useDropzone } = vi.hoisted(() => ({ useDropzone: vi.fn<(options: DropzoneOptions) => unknown>() }));

// The dropzone is replaced so that the limit it is configured with, and the rejection it reports,
// can be read without dragging a file into jsdom.
vi.mock("react-dropzone", () => ({ useDropzone }));

// Translations are stubbed by their key, with the size appended where one is passed, so that the
// limit a message names can be read off it.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && "size" in options ? `${key} ${options.size}` : key,
  }),
}));

vi.mock("../../../hooks/useRequiredId.ts", () => ({ useRequiredId: () => 1 }));
vi.mock("../../../hooks/useBoreholesNavigate.tsx", () => ({
  useBoreholesNavigate: () => ({ navigateTo: vi.fn() }),
}));

const maxFileSize = 210_000_000;
const largeMaxFileSize = 5_000_000_000;

setFileSizeLimits({ maxFileSize, largeMaxFileSize, maxImportArchiveSize: 1_000_000_000, chunkSize: 6 * 1024 * 1024 });

const tooLarge: FileRejection[] = [
  { file: new File(["x"], "report.pdf"), errors: [{ code: "file-too-large", message: "too large" }] },
];

const showAlert = vi.fn();

/** Renders the selector on a tab and hands back the options its dropzone was configured with. */
const renderOnTab = (activeTab: PanelTab): DropzoneOptions => {
  render(
    <MemoryRouter>
      <LabelingFileSelector
        activeTab={activeTab}
        isLoadingFiles={false}
        files={[]}
        setSelectedFile={vi.fn()}
        addFile={vi.fn()}
        showAlert={showAlert}
      />
    </MemoryRouter>,
  );

  return useDropzone.mock.calls[0][0];
};

describe("LabelingFileSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDropzone.mockReturnValue({ getRootProps: () => ({}), getInputProps: () => ({}) });
  });

  afterEach(() => {
    cleanup();
  });

  it("lets a profile be as large as the chunked upload accepts", () => {
    expect(renderOnTab(PanelTab.profile).maxSize).toBe(largeMaxFileSize);
  });

  it("holds a photo to what a single request accepts", () => {
    expect(renderOnTab(PanelTab.photo).maxSize).toBe(maxFileSize);
  });

  it("names the profile limit when a profile is refused as too large", () => {
    renderOnTab(PanelTab.profile).onDrop([], tooLarge);

    expect(showAlert).toHaveBeenCalledWith("fileMaxSizeExceeded 5 GB", "error");
  });

  it("names the photo limit when a photo is refused as too large", () => {
    renderOnTab(PanelTab.photo).onDrop([], tooLarge);

    expect(showAlert).toHaveBeenCalledWith("fileMaxSizeExceeded 210 MB", "error");
  });
});
