// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransferOptions, TransferProgressCallback } from "../../api/transferProgress.ts";
import { AlertContext } from "../alert/alertContext.tsx";
import { AlertContextInterface } from "../alert/alertInterfaces";
import { ExportDialog } from "./exportDialog.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
  }),
}));

const showAlert = vi.fn();
const alertContext: AlertContextInterface = {
  alertIsOpen: false,
  text: undefined,
  showAlert,
  closeAlert: vi.fn(),
};

/** The app marks elements with `data-cy` rather than the testing library's default attribute. */
const byCy = (name: string) => document.querySelector<HTMLElement>(`[data-cy="${name}"]`);

const clickCy = (name: string) => {
  const element = byCy(name);
  if (!element) throw new Error(`No element marked '${name}' to click.`);
  fireEvent.click(element);
};

/**
 * An export whose transfer the test drives: it hands back the callbacks the dialog passed in,
 * so progress can be reported and the finish delayed the way a real download would.
 */
const controllableExport = () => {
  let reportProgress: TransferProgressCallback = () => {};
  let finish: () => void = () => {};
  let receivedSignal: AbortSignal | undefined;
  let markStarted: () => void = () => {};
  const started = new Promise<void>(resolve => {
    markStarted = resolve;
  });

  const exportFunction = (options?: TransferOptions) => {
    reportProgress = options?.onProgress ?? (() => {});
    receivedSignal = options?.signal;
    markStarted();
    return new Promise<void>(resolve => {
      finish = resolve;
    });
  };

  return {
    exportFunction,
    started,
    reportProgress: (loaded: number) => reportProgress({ loaded }),
    finish: () => finish(),
    getSignal: () => receivedSignal,
  };
};

const ExportDialogHarness = ({ exportFunction }: { exportFunction: (options?: TransferOptions) => Promise<void> }) => {
  const [isExporting, setIsExporting] = useState(true);
  return (
    <AlertContext.Provider value={alertContext}>
      <ExportDialog
        isExporting={isExporting}
        setIsExporting={setIsExporting}
        exportItems={[{ label: "exportJsonProfile", exportFunction }]}
      />
    </AlertContext.Provider>
  );
};

const startExport = async (controllable: ReturnType<typeof controllableExport>) => {
  render(<ExportDialogHarness exportFunction={options => controllable.exportFunction(options)} />);
  clickCy("exportjsonprofile-button");
  await controllable.started;
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  cleanup();
});

describe("export progress", () => {
  it("shows the overlay while the export is being prepared", async () => {
    const controllable = controllableExport();

    await startExport(controllable);

    await waitFor(() => expect(byCy("loading-backdrop-status")).not.toBeNull());
    expect(byCy("loading-backdrop-message")?.textContent).toBe("preparingExport");
  });

  it("shows how much has been received once the transfer starts", async () => {
    const controllable = controllableExport();
    await startExport(controllable);

    controllable.reportProgress(2_500_000);

    await waitFor(() => expect(byCy("loading-backdrop-message")?.textContent).toBe("downloadingExport"));
    expect(byCy("loading-backdrop-hint")?.textContent).toContain("2.5 MB");
  });

  it("keeps the shown amount moving as more arrives", async () => {
    const controllable = controllableExport();
    await startExport(controllable);
    controllable.reportProgress(1_000_000);
    await waitFor(() => expect(byCy("loading-backdrop-hint")?.textContent).toContain("1.0 MB"));

    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"));
    controllable.reportProgress(4_000_000);

    await waitFor(() => expect(byCy("loading-backdrop-hint")?.textContent).toContain("4.0 MB"));
  });

  it("gives the export a signal so it can be cancelled", async () => {
    const controllable = controllableExport();
    await startExport(controllable);

    expect(controllable.getSignal()).toBeInstanceOf(AbortSignal);

    clickCy("loading-backdrop-cancel");

    expect(controllable.getSignal()?.aborted).toBe(true);
    await waitFor(() => expect(byCy("loading-backdrop-status")).toBeNull());
  });
});
