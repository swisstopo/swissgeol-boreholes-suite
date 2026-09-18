import { describe, expect, it } from "vitest";
import { LogImportResultItem } from "../logInterfaces.ts";
import { attachmentsToUpload, groupByOutcome } from "./importReport.ts";

const item = (overrides: Partial<LogImportResultItem>): LogImportResultItem => ({
  type: "File",
  identifier: "RUN-1 / a.las",
  outcome: "Added",
  messageKey: "importResultFileAdded",
  ...overrides,
});

describe("groupByOutcome", () => {
  it("returns the four groups in a fixed order", () => {
    const groups = groupByOutcome([
      item({ outcome: "Error" }),
      item({ outcome: "Added" }),
      item({ outcome: "SkippedIncomplete" }),
      item({ outcome: "AlreadyExists" }),
    ]);

    expect(groups.map(g => g.outcome)).toEqual(["Added", "AlreadyExists", "SkippedIncomplete", "Error"]);
  });

  it("drops groups that have no items", () => {
    const groups = groupByOutcome([item({ outcome: "Added" })]);

    expect(groups).toHaveLength(1);
  });

  it("puts runs before files within a group", () => {
    const groups = groupByOutcome([item({ type: "File" }), item({ type: "Run", identifier: "RUN-1" })]);

    expect(groups[0].items.map(i => i.type)).toEqual(["Run", "File"]);
  });
});

describe("attachmentsToUpload", () => {
  const fileA = new File(["a"], "a.las");
  const fileWithSpace = new File(["b"], "my log.las");

  it("matches an added file item to the dropped attachment", () => {
    const uploads = attachmentsToUpload([item({ logFileId: 7, logRunId: 3 })], { "RUN-1": [fileA] });

    expect(uploads).toEqual([{ logFileId: 7, logRunId: 3, file: fileA, identifier: "RUN-1 / a.las" }]);
  });

  it("matches a name whose spaces the server replaced", () => {
    const uploads = attachmentsToUpload([item({ identifier: "RUN-1 / my_log.las", logFileId: 7, logRunId: 3 })], {
      "RUN-1": [fileWithSpace],
    });

    expect(uploads).toHaveLength(1);
    expect(uploads[0].file).toBe(fileWithSpace);
  });

  it("ignores items that are not added files", () => {
    const uploads = attachmentsToUpload(
      [item({ outcome: "AlreadyExists" }), item({ type: "Run", identifier: "RUN-1", logRunId: 3 })],
      { "RUN-1": [fileA] },
    );

    expect(uploads).toHaveLength(0);
  });

  it("ignores an added item whose attachment is not held", () => {
    const uploads = attachmentsToUpload([item({ logFileId: 7, logRunId: 3 })], {});

    expect(uploads).toHaveLength(0);
  });

  it("matchesRegardlessOfFileNameCase", () => {
    const upperCaseFile = new File(["a"], "A.LAS");

    const uploads = attachmentsToUpload([item({ logFileId: 7, logRunId: 3 })], { "RUN-1": [upperCaseFile] });

    expect(uploads).toHaveLength(1);
    expect(uploads[0].file).toBe(upperCaseFile);
  });

  it("takesEachAttachmentFromItsOwnRun", () => {
    const run1File = new File(["run1"], "a.las");
    const run2File = new File(["run2"], "a.las");

    const uploads = attachmentsToUpload(
      [
        item({ identifier: "RUN-1 / a.las", logFileId: 7, logRunId: 3 }),
        item({ identifier: "RUN-2 / a.las", logFileId: 8, logRunId: 4 }),
      ],
      { "RUN-1": [run1File], "RUN-2": [run2File] },
    );

    expect(uploads).toHaveLength(2);
    expect(uploads[0].file).toBe(run1File);
    expect(uploads[1].file).toBe(run2File);
  });
});
