// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PanelTab } from "../../../api/dataextractionInterfaces.ts";
import { setFileSizeLimits } from "../../../api/fileSize.ts";
import { Profile } from "../../../api/generated";
import LabelingPanel from "./labelingPanel.tsx";

// The query results keep their identity between renders, as the real queries do, so that the
// effect which clears the selection while a borehole has no attachments does not run on every
// render and drop what an upload just selected.
const { getProfileForBorehole, noPhotos, noProfiles, uploadPhoto, uploadProfile } = vi.hoisted(() => ({
  getProfileForBorehole: vi.fn(),
  noPhotos: { data: [], isLoading: false },
  noProfiles: { data: [], isLoading: false },
  uploadPhoto: vi.fn(),
  uploadProfile: vi.fn(),
}));

/** The tab the panel is on, which the tests set before rendering. */
let panelTab = PanelTab.profile;

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

vi.mock("./labelingContext.tsx", () => ({
  useLabelingContext: () => ({
    panelPosition: "right",
    setPanelPosition: vi.fn(),
    extractionState: undefined,
    cancelRequest: vi.fn(),
    panelTab,
  }),
}));

vi.mock("../../../hooks/useRequiredId.ts", () => ({ useRequiredId: () => 1 }));
vi.mock("../../../api/dataextraction.ts", () => ({ useFileInfo: () => ({ data: undefined, isLoading: false }) }));

vi.mock("../../../api/profile.ts", () => ({
  getProfileForBorehole,
  uploadProfile,
  useProfiles: () => noProfiles,
  useReloadProfiles: () => vi.fn(),
}));

vi.mock("../attachments/tabs/photo.ts", () => ({
  uploadPhoto,
  usePhotoImage: () => ({ data: undefined, isLoading: false }),
  usePhotos: () => noPhotos,
  useReloadPhotos: () => vi.fn(),
}));

// The children are stubbed down to what the tests read: which attachment the panel settled on.
vi.mock("./labelingHeader.tsx", () => ({ LabelingHeader: () => null }));
vi.mock("./labelingFileSelector.tsx", () => ({ default: () => null }));
vi.mock("./floatingExtractionFeedback.tsx", () => ({ FloatingExtractionFeedback: () => null }));
vi.mock("./pageSelection.tsx", () => ({ PageSelection: () => null }));
vi.mock("./labelingView.tsx", () => ({ LabelingView: () => null }));
vi.mock("./labelingExtraction.tsx", () => ({
  LabelingExtraction: ({ selectedFile }: { selectedFile?: Profile }) => (
    <div data-testid="selected-profile">{selectedFile?.name ?? ""}</div>
  ),
}));

const maxFileSize = 210_000_000;
const largeMaxFileSize = 5_000_000_000;

setFileSizeLimits({ maxFileSize, largeMaxFileSize, maxImportArchiveSize: 1_000_000_000, chunkSize: 6 * 1024 * 1024 });

/** A file that reports a size without holding one, so the limits can be tried without the bytes. */
const fileOfSize = (bytes: number, name: string, type: string): File => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
};

/** Picks a file on the tab the panel is on, as the hidden input does. */
const pickFile = async (tab: PanelTab, file: File) => {
  panelTab = tab;
  const { container } = render(<LabelingPanel />);
  const input = container.querySelector('input[type="file"]');
  if (input === null) throw new Error("The panel renders no file input.");

  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
  });
};

const oversizedForSingleRequest = () => fileOfSize(1_000_000_000, "report.pdf", "application/pdf");

describe("LabelingPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    panelTab = PanelTab.profile;
  });

  afterEach(() => {
    cleanup();
  });

  it("uploads a profile that is larger than a single request would take", async () => {
    uploadProfile.mockResolvedValue(7);
    getProfileForBorehole.mockResolvedValue({ id: 7, boreholeId: 1, name: "report.pdf" });

    await pickFile(PanelTab.profile, oversizedForSingleRequest());

    expect(uploadProfile).toHaveBeenCalledWith(1, expect.any(File));
  });

  it("shows the profile the server stored rather than one built from the upload", async () => {
    uploadProfile.mockResolvedValue(7);
    getProfileForBorehole.mockResolvedValue({ id: 7, boreholeId: 1, name: "stored.pdf" });

    await pickFile(PanelTab.profile, oversizedForSingleRequest());

    expect(getProfileForBorehole).toHaveBeenCalledWith(1, 7);
    expect(screen.getByTestId("selected-profile").textContent).toBe("stored.pdf");
  });

  it("refuses a photo that is larger than a single request would take", async () => {
    await pickFile(PanelTab.photo, fileOfSize(1_000_000_000, "site.jpg", "image/jpeg"));

    expect(uploadPhoto).not.toHaveBeenCalled();
  });

  it("uploads a photo within what a single request takes", async () => {
    uploadPhoto.mockResolvedValue({ id: 3, boreholeId: 1, fromDepth: 0 });

    await pickFile(PanelTab.photo, fileOfSize(1_000_000, "site.jpg", "image/jpeg"));

    expect(uploadPhoto).toHaveBeenCalledWith(1, expect.any(File));
  });
});
