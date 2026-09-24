import { describe, expect, it } from "vitest";
import { LogImportResultItem } from "../logInterfaces.ts";
import { attachmentsToUpload, groupByOutcome } from "./importReport.ts";

type ItemOverrides = Partial<LogImportResultItem> & { runNumber?: string; fileName?: string };

/** Builds a file item the way the server does, with the identifier and the values agreeing. */
const fileItem = ({
  runNumber = "RUN-1",
  fileName = "a.las",
  ...overrides
}: ItemOverrides = {}): LogImportResultItem => ({
  type: "File",
  identifier: `${runNumber} / ${fileName}`,
  outcome: "Added",
  messageKey: "importResultFileAdded",
  values: { runNumber, fileName },
  ...overrides,
});

const runItem = ({ runNumber = "RUN-1", ...overrides }: ItemOverrides = {}): LogImportResultItem => ({
  type: "Run",
  identifier: runNumber,
  outcome: "Added",
  messageKey: "importResultRunAdded",
  values: { runNumber },
  ...overrides,
});

describe("groupByOutcome", () => {
  it("returns the four groups in a fixed order", () => {
    const groups = groupByOutcome([
      fileItem({ outcome: "Error" }),
      fileItem({ outcome: "Added" }),
      fileItem({ outcome: "SkippedIncomplete" }),
      fileItem({ outcome: "AlreadyExists" }),
    ]);

    expect(groups.map(g => g.outcome)).toEqual(["Added", "AlreadyExists", "SkippedIncomplete", "Error"]);
  });

  it("drops groups that have no items", () => {
    const groups = groupByOutcome([fileItem({ outcome: "Added" })]);

    expect(groups).toHaveLength(1);
  });

  it("puts runs before files within a group", () => {
    const groups = groupByOutcome([fileItem(), runItem()]);

    expect(groups[0].items.map(i => i.type)).toEqual(["Run", "File"]);
  });
});

describe("attachmentsToUpload", () => {
  const fileA = new File(["a"], "a.las");
  const fileWithSpace = new File(["b"], "my log.las");

  it("matches an added file item to the dropped attachment", () => {
    const uploads = attachmentsToUpload([fileItem({ logFileId: 7, logRunId: 3 })], { "RUN-1": [fileA] });

    expect(uploads).toEqual([{ logFileId: 7, logRunId: 3, file: fileA, identifier: "RUN-1 / a.las" }]);
  });

  it("matches a name whose spaces the server replaced", () => {
    const uploads = attachmentsToUpload([fileItem({ fileName: "my_log.las", logFileId: 7, logRunId: 3 })], {
      "RUN-1": [fileWithSpace],
    });

    expect(uploads).toHaveLength(1);
    expect(uploads[0].file).toBe(fileWithSpace);
  });

  it("matches a file name that contains the identifier separator", () => {
    const awkwardFile = new File(["c"], "a / b.las");

    const uploads = attachmentsToUpload([fileItem({ fileName: "a_/_b.las", logFileId: 7, logRunId: 3 })], {
      "RUN-1": [awkwardFile],
    });

    expect(uploads).toHaveLength(1);
    expect(uploads[0].file).toBe(awkwardFile);
  });

  it("ignores items that are not added files", () => {
    const uploads = attachmentsToUpload([fileItem({ outcome: "AlreadyExists" }), runItem({ logRunId: 3 })], {
      "RUN-1": [fileA],
    });

    expect(uploads).toHaveLength(0);
  });

  it("ignores an added item whose attachment is not held", () => {
    const uploads = attachmentsToUpload([fileItem({ logFileId: 7, logRunId: 3 })], {});

    expect(uploads).toHaveLength(0);
  });

  it("ignores an added item that names no file", () => {
    const uploads = attachmentsToUpload([fileItem({ logFileId: 7, logRunId: 3, values: undefined })], {
      "RUN-1": [fileA],
    });

    expect(uploads).toHaveLength(0);
  });

  it("matchesRegardlessOfFileNameCase", () => {
    const upperCaseFile = new File(["a"], "A.LAS");

    const uploads = attachmentsToUpload([fileItem({ logFileId: 7, logRunId: 3 })], { "RUN-1": [upperCaseFile] });

    expect(uploads).toHaveLength(1);
    expect(uploads[0].file).toBe(upperCaseFile);
  });

  it("takesEachAttachmentFromItsOwnRun", () => {
    const run1File = new File(["run1"], "a.las");
    const run2File = new File(["run2"], "a.las");

    const uploads = attachmentsToUpload(
      [fileItem({ logFileId: 7, logRunId: 3 }), fileItem({ runNumber: "RUN-2", logFileId: 8, logRunId: 4 })],
      { "RUN-1": [run1File], "RUN-2": [run2File] },
    );

    expect(uploads).toHaveLength(2);
    expect(uploads[0].file).toBe(run1File);
    expect(uploads[1].file).toBe(run2File);
  });
});
