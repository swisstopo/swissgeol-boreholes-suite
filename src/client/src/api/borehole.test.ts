// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { buildBulkEditRequest, exportJsonWithAttachmentsBorehole } from "./borehole.ts";
import { TransferOptions } from "./transferProgress.ts";

const downloadArchive = vi.hoisted(() => vi.fn());
vi.mock("./download.ts", () => ({ download: vi.fn(), downloadData: vi.fn(), downloadArchive }));

describe("buildBulkEditRequest", () => {
  it("maps changed entries into update + fieldsToUpdate mask", () => {
    const request = buildBulkEditRequest(
      [1, 2, 3],
      [
        ["projectName", "New project"],
        ["restrictionId", 20111003],
        ["totalDepth", 42],
      ],
    );

    expect(request.boreholeIds).toEqual([1, 2, 3]);
    expect(request.fieldsToUpdate).toEqual(["projectName", "restrictionId", "totalDepth"]);
    expect(request.update).toEqual({ projectName: "New project", restrictionId: 20111003, totalDepth: 42 });
  });

  it("keeps a null value in the update so the field is cleared", () => {
    const request = buildBulkEditRequest([5], [["restrictionId", null]]);

    expect(request.fieldsToUpdate).toEqual(["restrictionId"]);
    expect(request.update).toEqual({ restrictionId: null });
  });
});

describe("exportJsonWithAttachmentsBorehole", () => {
  it("saves the export as an archive under the given name, handing on the options", async () => {
    const options: TransferOptions = { onProgress: vi.fn(), signal: new AbortController().signal };

    await exportJsonWithAttachmentsBorehole([1, 2], "bulkexport_2026-01-01", options);

    expect(downloadArchive).toHaveBeenCalledWith(
      "boreholeexport/zip?ids=1&ids=2",
      "bulkexport_2026-01-01.zip",
      options,
    );
  });
});
