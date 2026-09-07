// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { FormErrors } from "../../../../components/form/form.ts";
import { LogFile, LogRun, LogRunChangeTracker } from "./logInterfaces.ts";
import {
  applyUploadedFiles,
  buildFileName,
  getFileExtension,
  parseLogFilesCsv,
  prepareLogRunForSubmit,
  validateFiles,
} from "./logUtils.ts";

function createCsvFile(content: string): File {
  return new File([content], "test.csv", { type: "text/csv" });
}

describe("buildFileName", () => {
  it("combines name and extension", () => {
    expect(buildFileName(["run1", "file", "las"], 1, 2)).toBe("file.las");
  });

  it("returns name only when extensionIndex is -1", () => {
    expect(buildFileName(["run1", "file"], 1, -1)).toBe("file");
  });

  it("returns name only when extension column is empty", () => {
    expect(buildFileName(["run1", "file", ""], 1, 2)).toBe("file");
  });

  it("trims whitespace from name and extension", () => {
    expect(buildFileName(["run1", " file ", " las "], 1, 2)).toBe("file.las");
  });

  it("returns empty string when name column is missing", () => {
    expect(buildFileName(["run1"], 1, 2)).toBe("");
  });
});

describe("parseLogFilesCsv", () => {
  it("returns empty result for empty file", async () => {
    const file = createCsvFile("");
    const result = await parseLogFilesCsv(file);
    expect(result.requiredFilesPerRun).toEqual({});
  });

  it("returns empty result when RunNumber header is missing", async () => {
    const csv = "Name;Extension\nfile;las\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({});
  });

  it("parses a valid CSV with name and extension", async () => {
    const csv = "RunNumber;Name;Extension\nRUN-1;welllog;las\nRUN-2;data;txt\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({
      "RUN-1": ["welllog.las"],
      "RUN-2": ["data.txt"],
    });
  });

  it("groups multiple files under the same run", async () => {
    const csv = "RunNumber;Name;Extension\nRUN-1;file1;las\nRUN-1;file2;txt\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({
      "RUN-1": ["file1.las", "file2.txt"],
    });
  });

  it("handles CSV without Extension column", async () => {
    const csv = "RunNumber;Name\nRUN-1;welllog.las\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({
      "RUN-1": ["welllog.las"],
    });
  });

  it("handles CSV without Name column", async () => {
    const csv = "RunNumber;Extension\nRUN-1;las\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({
      "RUN-1": [],
    });
  });

  it("skips rows with empty RunNumber", async () => {
    const csv = "RunNumber;Name;Extension\nRUN-1;file1;las\n;empty;txt\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({
      "RUN-1": ["file1.las"],
    });
  });

  it("is case-insensitive for headers", async () => {
    const csv = "RUNNUMBER;NAME;EXTENSION\nRUN-1;file;las\n";
    const result = await parseLogFilesCsv(createCsvFile(csv));
    expect(result.requiredFilesPerRun).toEqual({
      "RUN-1": ["file.las"],
    });
  });
});

describe("getFileExtension", () => {
  it("returns the file extension in lowercase", () => {
    expect(getFileExtension("document.PDF")).toBe("pdf");
  });

  it("returns the last extension for multi-dot filenames", () => {
    expect(getFileExtension("archive.tar.gz")).toBe("gz");
  });

  it("returns empty string for no extension", () => {
    expect(getFileExtension("file")).toBe("file");
  });

  it("returns placeholder when filename is undefined", () => {
    expect(getFileExtension(undefined, "n/a")).toBe("n/a");
  });

  it("returns empty string when filename is undefined and no placeholder", () => {
    expect(getFileExtension(undefined)).toBe("");
  });
});

describe("validateFiles", () => {
  function makeLogRun(files: Array<{ name?: string }>): LogRun {
    return {
      logFiles: files.map(f => ({ name: f.name })),
    } as unknown as LogRun;
  }

  it("does nothing when logFiles is empty", () => {
    const errors: FormErrors = {};
    validateFiles(makeLogRun([]), errors);
    expect(errors).toEqual({});
  });

  it("does nothing when logFiles is undefined", () => {
    const errors: FormErrors = {};
    validateFiles({ logFiles: undefined } as LogRun, errors);
    expect(errors).toEqual({});
  });

  it("adds required error for files with empty name", () => {
    const errors: FormErrors = {};
    validateFiles(makeLogRun([{ name: "" }]), errors);
    expect(errors.logFiles).toBeDefined();
  });

  it("adds required error for files with missing name", () => {
    const errors: FormErrors = {};
    validateFiles(makeLogRun([{ name: undefined }]), errors);
    expect(errors.logFiles).toBeDefined();
  });

  it("does not add errors for valid unique names", () => {
    const errors: FormErrors = {};
    validateFiles(makeLogRun([{ name: "file1.las" }, { name: "file2.las" }]), errors);
    expect(errors).toEqual({});
  });

  it("adds error for duplicate file names (case-insensitive)", () => {
    const errors: FormErrors = {};
    validateFiles(makeLogRun([{ name: "File.las" }, { name: "file.las" }]), errors);
    expect(errors.logFiles).toBeDefined();
  });
});

const createPendingFile = (id: number, name: string): LogFile => ({
  id,
  tmpId: name,
  logRunId: 7,
  name,
  file: new File([], name),
  toolTypeCodelistIds: [],
  public: true,
});

const createLogRun = (): LogRun => ({
  id: 7,
  tmpId: "7",
  boreholeId: 1,
  runNumber: "R-1",
  fromDepth: 0,
  toDepth: 100,
  logFiles: [createPendingFile(3, "gamma.las")],
});

describe("prepareLogRunForSubmit", () => {
  it("keeps the identity the table and the modal select a run by", () => {
    const logRun = createLogRun();

    prepareLogRunForSubmit(logRun);

    expect(logRun.tmpId).toBe("7");
    expect(logRun.logFiles?.[0].tmpId).toBe("gamma.las");
    expect(logRun.logFiles?.[0].name).toBe("gamma.las");
  });

  it("leaves the fields the client keeps for itself out of the payload", () => {
    const payload = prepareLogRunForSubmit(createLogRun());

    expect(payload.tmpId).toBeUndefined();
    expect(payload.logFiles?.[0].tmpId).toBeUndefined();
    expect(payload.logFiles?.[0].name).toBeUndefined();
  });
});

describe("applyUploadedFiles", () => {
  const runs = (): LogRunChangeTracker[] => [
    {
      item: { ...createLogRun(), logFiles: [createPendingFile(0, "first.las"), createPendingFile(0, "second.las")] },
      hasChanges: true,
    },
  ];

  it("marks the files a cancelled save got through and leaves the rest pending", () => {
    // The upload of the second file was given up on, so it still carries its blob.
    const submitted: LogFile[] = [
      { ...createPendingFile(11, "first.las"), file: undefined },
      createPendingFile(0, "second.las"),
    ];

    const [updated] = applyUploadedFiles(runs(), "7", submitted);

    expect(updated.item.logFiles?.[0].id).toBe(11);
    expect(updated.item.logFiles?.[0].file).toBeUndefined();
    expect(updated.item.logFiles?.[1].file).toBeDefined();
  });

  it("keeps the name the file is shown by", () => {
    const submitted: LogFile[] = [{ ...createPendingFile(11, "first.las"), name: undefined, file: undefined }];

    const [updated] = applyUploadedFiles(runs(), "7", submitted);

    expect(updated.item.tmpId).toBe("7");
    expect(updated.item.logFiles?.[0].name).toBe("first.las");
  });

  it("leaves other runs untouched", () => {
    const original = runs();

    expect(applyUploadedFiles(original, "other", [])[0]).toBe(original[0]);
  });
});
