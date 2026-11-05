// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransferOptions, TransferProgressCallback } from "../../api/transferProgress.ts";
import { AlertContext } from "../alert/alertContext.tsx";
import { AlertContextInterface } from "../alert/alertInterfaces";
import { Prompt } from "../prompt/prompt.tsx";
import { PromptProvider } from "../prompt/promptContext.tsx";
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

  // Rejects once aborted, with an error that is not an AbortError: the dialog must tell a cancelled
  // export from its own signal, whatever reason the transfer rejects with.
  const exportFunction = (options?: TransferOptions) => {
    reportProgress = options?.onProgress ?? (() => {});
    receivedSignal = options?.signal;
    markStarted();
    return new Promise<void>((resolve, reject) => {
      finish = resolve;
      options?.signal?.addEventListener("abort", () => reject(new Error("The transfer was aborted.")));
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

const ConfirmingExportDialogHarness = ({ exportFunction }: { exportFunction: () => Promise<void> }) => {
  const [isExporting, setIsExporting] = useState(true);
  return (
    <AlertContext.Provider value={alertContext}>
      <PromptProvider>
        <ExportDialog
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          exportItems={[
            {
              label: "JSON",
              exportFunction,
              confirmation: { message: "exportJsonLimitedTo500", confirmLabel: "exportFirst500" },
            },
          ]}
        />
        <Prompt />
      </PromptProvider>
    </AlertContext.Provider>
  );
};

const byPromptCy = (name: string) => document.querySelector<HTMLElement>(`[data-cy="prompt"] [data-cy="${name}"]`);

const clickPromptCy = (name: string) => {
  const element = byPromptCy(name);
  if (!element) throw new Error(`No prompt element marked '${name}' to click.`);
  fireEvent.click(element);
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

  it("does not report a cancelled export as an error", async () => {
    const controllable = controllableExport();
    await startExport(controllable);

    clickCy("loading-backdrop-cancel");

    await waitFor(() => expect(byCy("loading-backdrop-status")).toBeNull());
    await vi.runAllTimersAsync();
    expect(showAlert).not.toHaveBeenCalled();
  });

  it("reports an export that fails on its own", async () => {
    const exportFunction = vi.fn(() => Promise.reject(new Error("connection lost")));
    render(<ExportDialogHarness exportFunction={exportFunction} />);

    clickCy("exportjsonprofile-button");

    await waitFor(() => expect(showAlert).toHaveBeenCalledWith("errorDuringExport", "error"));
  });

  it("cancels the running export when the dialog goes away", async () => {
    const controllable = controllableExport();
    await startExport(controllable);

    cleanup();

    expect(controllable.getSignal()?.aborted).toBe(true);
  });
});

describe("export confirmation", () => {
  it("asks before running an export that needs confirmation", async () => {
    const exportFunction = vi.fn(() => Promise.resolve());
    render(<ConfirmingExportDialogHarness exportFunction={exportFunction} />);

    clickCy("json-button");

    await waitFor(() => expect(byCy("prompt")?.textContent).toContain("exportJsonLimitedTo500"));
    expect(exportFunction).not.toHaveBeenCalled();
  });

  it("returns to the export dialog when the confirmation is cancelled", async () => {
    const exportFunction = vi.fn(() => Promise.resolve());
    render(<ConfirmingExportDialogHarness exportFunction={exportFunction} />);
    clickCy("json-button");
    await waitFor(() => expect(byPromptCy("cancel-button")).not.toBeNull());

    clickPromptCy("cancel-button");

    await waitFor(() => expect(byCy("prompt")).toBeNull());
    expect(byCy("json-button")).not.toBeNull();
    expect(exportFunction).not.toHaveBeenCalled();
  });

  it("runs the export once confirmed", async () => {
    const exportFunction = vi.fn(() => Promise.resolve());
    render(<ConfirmingExportDialogHarness exportFunction={exportFunction} />);
    clickCy("json-button");
    await waitFor(() => expect(byPromptCy("exportfirst500-button")).not.toBeNull());

    clickPromptCy("exportfirst500-button");

    await waitFor(() => expect(exportFunction).toHaveBeenCalledTimes(1));
  });
});
