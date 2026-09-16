// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransferOptions } from "../../../../api/transferProgress.ts";

const downloadPost = vi.hoisted(() => vi.fn());
vi.mock("../../../../api/download.ts", () => ({ downloadPost }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "de" }, t: (key: string) => key }) }));

const { exportLogFiles, exportLogRuns, useLogExport } = await import("./log.ts");

const transferOptions: TransferOptions = { onProgress: vi.fn(), signal: new AbortController().signal };

describe("log export transfer options", () => {
  it("hands the options to the request when exporting log runs", async () => {
    await exportLogRuns([1, 2], true, "de", transferOptions);

    expect(downloadPost).toHaveBeenCalledWith(
      "log/export",
      { logRunIds: [1, 2], withAttachments: true, locale: "de" },
      transferOptions,
    );
  });

  it("hands the options to the request when exporting log files", async () => {
    await exportLogFiles([7], false, "en", transferOptions);

    expect(downloadPost).toHaveBeenCalledWith(
      "log/export",
      { logFileIds: [7], withAttachments: false, locale: "en" },
      transferOptions,
    );
  });

  it("passes the dialog's options on to the export, so the transfer reports and can be cancelled", () => {
    const exportFn = vi.fn().mockResolvedValue(new Response());
    const rows = [{ id: 5 }];
    const { result } = renderHook(() => useLogExport(exportFn, [5], rows));

    result.current.exportItems.forEach(item => item.exportFunction(transferOptions));

    expect(exportFn).toHaveBeenNthCalledWith(1, [5], false, "de", transferOptions);
    expect(exportFn).toHaveBeenNthCalledWith(2, [5], true, "de", transferOptions);
  });
});
