// @vitest-environment jsdom
import { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { cleanup, configure, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoreholeAttachment } from "../../../../../api/unionTypes.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
import { AlertContextInterface } from "../../../../../components/alert/alertInterfaces.ts";
import { StratigraphyExtractionDialog } from "./stratigraphyExtractionDialog.tsx";

// Unlike stratigraphyExtractionDialog.test.tsx, this test keeps the real extraction view, preview container and
// query hooks, so the page the preview shows results from their interplay with a shared query cache. Only the
// network, the OpenLayers map and the lithology tables are replaced.

// The codebase tags elements with data-cy; map Testing Library's getByTestId to it.
configure({ testIdAttribute: "data-cy" });

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-router", () => ({ useLocation: () => ({ hash: "" }), useParams: () => ({ id: "42" }) }));
vi.mock("../stratigraphy.ts", () => ({
  useAddExtractedStratigraphies: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("../../../../../hooks/useBoreholesNavigate.tsx", () => ({
  useBoreholesNavigate: () => ({ navigateTo: vi.fn() }),
}));
vi.mock("./stratigraphyExtractionItem.tsx", () => ({ StratigraphyExtractionItem: () => null }));
vi.mock("../../../labeling/labelingView.tsx", () => ({
  LabelingView: ({ fileName }: { fileName?: string }) => <span aria-label="preview-image">{fileName}</span>,
}));
vi.mock("../../../../../utils.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("../../../../../utils.ts")>()),
  getImageFromBlob: () => Promise.resolve(new Image()),
}));
vi.mock("../../../../../api/profile.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("../../../../../api/profile.ts")>()),
  useProfileOcrStatusOf: () => ({ ocrStatus: "Success", isStatusUnavailable: false, reloadStatus: vi.fn() }),
}));

const pageCount = 10;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// File info and page images answer quickly; the extraction answers later, as it does in the application.
vi.mock("../../../../../api/fetchApiV2.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("../../../../../api/fetchApiV2.ts")>()),
  fetchApiV2WithApiError: async (url: string) => {
    await wait(10);
    const pageIndex = /index=(\d+)/.exec(url)?.[1];
    return pageIndex ? { fileName: `page_${pageIndex}`, width: 10, height: 10, count: pageCount } : new Blob();
  },
}));

const extractionResponse = {
  boreholes: [
    { page_numbers: [7], layers: [] },
    { page_numbers: [8], layers: [] },
  ],
};

const file = { id: 1, name: "profile.pdf", nameUuid: "profile-uuid.pdf" } as BoreholeAttachment;

let queryClient: QueryClient;
const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AlertContext.Provider value={{ showAlert: vi.fn() } as unknown as AlertContextInterface}>
      {children}
    </AlertContext.Provider>
  </QueryClientProvider>
);

const renderDialog = () =>
  render(<StratigraphyExtractionDialog file={file} setSelectedFile={vi.fn()} open setOpen={vi.fn()} />, {
    wrapper: Wrapper,
  });

const waitUntilSettled = async () => {
  await waitFor(() => expect(screen.queryByTestId("stratigraphy-extraction-running")).not.toBeInTheDocument());
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  await wait(50);
};

describe("StratigraphyExtractionDialog preview page", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        await wait(100);
        return new Response(JSON.stringify(extractionResponse), { status: 200 });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the first page of the first extracted stratigraphy", async () => {
    renderDialog();
    await waitUntilSettled();

    expect(screen.getByText(`7 / ${pageCount}`)).toBeInTheDocument();
    expect(screen.getByLabelText("preview-image")).toHaveTextContent("page_7");
  });

  it("shows the first page of the first extracted stratigraphy when the profile is extracted again", async () => {
    const firstExtraction = renderDialog();
    await waitUntilSettled();
    firstExtraction.unmount();

    // The query client keeps the file info and page images, but not the extraction result, so this extracts again.
    renderDialog();
    await waitUntilSettled();

    expect(screen.getByText(`7 / ${pageCount}`)).toBeInTheDocument();
    expect(screen.getByLabelText("preview-image")).toHaveTextContent("page_7");
  });
});
