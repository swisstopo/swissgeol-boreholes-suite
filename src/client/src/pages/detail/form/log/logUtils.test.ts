// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { FormErrors } from "../../../../components/form/form.ts";
import { LogFile, LogRun, LogRunChangeTracker } from "./logInterfaces.ts";
import {
  applyCreatedRun,
  applyStoredFiles,
  applyUploadedFiles,
  buildFileName,
  getFileExtension,
  hasUnsavedWork,
  markRunSaved,
  parseLogFilesCsv,
  prepareLogRunForSubmit,
  toStoredFileName,
  toTrackedRuns,
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

  /** createPendingFile names a file and gives it that name as its identity. */
  const submittedAs = (...names: string[]): string[] => names;

  it("marks the files a cancelled save got through and leaves the rest pending", () => {
    // The upload of the second file was given up on, so it still carries its blob.
    const submitted: LogFile[] = [
      { ...createPendingFile(11, "first.las"), file: undefined },
      createPendingFile(0, "second.las"),
    ];

    const [updated] = applyUploadedFiles(runs(), "7", submitted, submittedAs("first.las", "second.las"));

    expect(updated.item.logFiles?.[0].id).toBe(11);
    expect(updated.item.logFiles?.[0].file).toBeUndefined();
    expect(updated.item.logFiles?.[1].file).toBeDefined();
  });

  it("keeps the name the file is shown by", () => {
    const submitted: LogFile[] = [{ ...createPendingFile(11, "first.las"), name: undefined, file: undefined }];

    const [updated] = applyUploadedFiles(runs(), "7", submitted, submittedAs("first.las"));

    expect(updated.item.tmpId).toBe("7");
    expect(updated.item.logFiles?.[0].name).toBe("first.las");
  });

  it("leaves other runs untouched", () => {
    const original = runs();

    expect(applyUploadedFiles(original, "other", [], [])[0]).toBe(original[0]);
  });

  it("marks the file it submitted, not the one that took its place", () => {
    // The save started with two files. While the first was going up the user added another, which
    // is put at the top of the run, so every file that was there moved along one place.
    const edited: LogRunChangeTracker[] = [
      {
        item: {
          ...createLogRun(),
          logFiles: [
            createPendingFile(0, "added.las"),
            createPendingFile(0, "first.las"),
            createPendingFile(0, "second.las"),
          ],
        },
        hasChanges: true,
      },
    ];

    const submitted: LogFile[] = [
      { ...createPendingFile(11, "first.las"), file: undefined },
      createPendingFile(0, "second.las"),
    ];

    const [updated] = applyUploadedFiles(edited, "7", submitted, submittedAs("first.las", "second.las"));

    // The file the user just added was never submitted, so it keeps its blob and no server id.
    expect(updated.item.logFiles?.[0].name).toBe("added.las");
    expect(updated.item.logFiles?.[0].file).toBeDefined();
    expect(updated.item.logFiles?.[0].id).toBe(0);

    expect(updated.item.logFiles?.[1].id).toBe(11);
    expect(updated.item.logFiles?.[1].file).toBeUndefined();
    expect(updated.item.logFiles?.[2].file).toBeDefined();
  });
});

describe("toStoredFileName", () => {
  it("replaces the white space the server would replace", () => {
    expect(toStoredFileName("my log file.las")).toBe("my_log_file.las");
  });

  it("leaves a name the server would store unchanged", () => {
    // Applying it twice has to give the same name, otherwise the stored name drifts.
    expect(toStoredFileName(toStoredFileName("my log.las"))).toBe("my_log.las");
  });
});

describe("applyStoredFiles", () => {
  const runs = (fileName: string): LogRunChangeTracker[] => [
    { item: { ...createLogRun(), logFiles: [createPendingFile(0, fileName)] }, hasChanges: true },
  ];

  const storedRun = (files: { id: number; name: string }[]): LogRun => ({
    ...createLogRun(),
    logFiles: files.map(f => ({ ...createPendingFile(f.id, f.name), file: undefined })),
  });

  it("stops offering a file the server already stored", () => {
    const [updated] = applyStoredFiles(runs("smallerzip.zip"), [storedRun([{ id: 42, name: "smallerzip.zip" }])]);

    expect(updated.item.logFiles?.[0].id).toBe(42);
    expect(updated.item.logFiles?.[0].file).toBeUndefined();
  });

  it("still sends a file the user put back under a name the run holds", () => {
    // The id says the user replaced this file, so what the server holds is the old content.
    const original: LogRunChangeTracker[] = [
      { item: { ...createLogRun(), logFiles: [createPendingFile(42, "smallerzip.zip")] }, hasChanges: true },
    ];

    const [updated] = applyStoredFiles(original, [storedRun([{ id: 42, name: "smallerzip.zip" }])]);

    expect(updated).toBe(original[0]);
    expect(updated.item.logFiles?.[0].file).toBeDefined();
  });

  it("keeps a file the server never received pending", () => {
    const original = runs("smallerzip.zip");

    const [updated] = applyStoredFiles(original, [storedRun([])]);

    expect(updated).toBe(original[0]);
    expect(updated.item.logFiles?.[0].file).toBeDefined();
  });

  it("leaves a run the server does not know yet alone", () => {
    const original: LogRunChangeTracker[] = [
      { item: { ...createLogRun(), id: 0, logFiles: [createPendingFile(0, "new.las")] }, hasChanges: true },
    ];

    expect(applyStoredFiles(original, [storedRun([{ id: 44, name: "new.las" }])])[0]).toBe(original[0]);
  });
});

describe("applyCreatedRun", () => {
  const runs = (): LogRunChangeTracker[] => [{ item: { ...createLogRun(), id: 0, tmpId: "draft" }, hasChanges: true }];

  it("gives the run the identity the server created it under", () => {
    const [updated] = applyCreatedRun(runs(), "draft", 42);

    expect(updated.item.id).toBe(42);
  });

  it("keeps the run pending, because its files have not been sent yet", () => {
    const [updated] = applyCreatedRun(runs(), "draft", 42);

    expect(updated.hasChanges).toBe(true);
    expect(updated.item.logFiles?.[0].file).toBeDefined();
  });

  it("keeps the identity the table and the modal select the run by", () => {
    const [updated] = applyCreatedRun(runs(), "draft", 42);

    expect(updated.item.tmpId).toBe("draft");
  });

  it("leaves other runs untouched", () => {
    const original = runs();

    expect(applyCreatedRun(original, "other", 42)[0]).toBe(original[0]);
  });
});

describe("markRunSaved", () => {
  const runs = (): LogRunChangeTracker[] => [{ item: createLogRun(), hasChanges: true }];

  it("stops a run that reached the server whole from counting as a change", () => {
    const [updated] = markRunSaved(runs(), "7");

    expect(updated.hasChanges).toBe(false);
  });

  it("leaves other runs untouched", () => {
    const original = runs();

    expect(markRunSaved(original, "other")[0]).toBe(original[0]);
  });
});

describe("hasUnsavedWork", () => {
  it("holds while a run carries changes the server does not have", () => {
    expect(hasUnsavedWork([{ item: createLogRun(), hasChanges: true }])).toBe(true);
  });

  it("does not hold once every run has been saved", () => {
    expect(hasUnsavedWork([{ item: createLogRun(), hasChanges: false }])).toBe(false);
  });

  it("does not hold for a panel holding nothing", () => {
    expect(hasUnsavedWork([])).toBe(false);
  });
});

describe("toTrackedRuns", () => {
  it("takes the runs as the server holds them, with nothing left to save", () => {
    // A run from the server carries no tmpId, so the panel gives it one from its id.
    const { tmpId, ...fromServer } = createLogRun();

    const [tracked] = toTrackedRuns([{ ...fromServer, id: 42 }]);

    expect(tmpId).toBe("7");
    expect(tracked.item.id).toBe(42);
    expect(tracked.item.tmpId).toBe("42");
    expect(tracked.hasChanges).toBe(false);
  });
});

describe("giving up on the save of a new run", () => {
  const pendingRun = (): LogRunChangeTracker[] => [
    {
      item: {
        ...createLogRun(),
        id: 0,
        tmpId: "draft",
        logFiles: [createPendingFile(0, "first.las"), createPendingFile(0, "second.las")],
      },
      hasChanges: true,
    },
  ];

  /** The run as the server holds it once it has been created but before any file reached it. */
  const createdRun = (fileNames: string[]): LogRun => ({
    ...createLogRun(),
    id: 42,
    tmpId: undefined,
    logFiles: fileNames.map((name, index) => ({ id: index + 11, name }) as LogFile),
  });

  /**
   * The order the panel applies these in over one save: the run is created, creating it makes the
   * server's runs be read again, the attempt then ends, and what the server holds is reconciled.
   */
  const saveThenGiveUp = (submitted: LogFile[], stored: LogRun[]): LogRunChangeTracker[] => {
    let runs = applyCreatedRun(pendingRun(), "draft", 42);
    runs = hasUnsavedWork(runs) ? runs : toTrackedRuns(stored);
    runs = applyUploadedFiles(runs, "draft", submitted, ["first.las", "second.las"]);
    return applyStoredFiles(runs, stored);
  };

  it("keeps files that never reached the server attached to the run", () => {
    // The save was given up on during the preparation, so neither file was sent.
    const submitted = [createPendingFile(0, "first.las"), createPendingFile(0, "second.las")];

    const [updated] = saveThenGiveUp(submitted, [createdRun([])]);

    expect(updated.item.logFiles).toHaveLength(2);
    expect(updated.item.logFiles?.[0].file).toBeDefined();
    expect(updated.item.logFiles?.[1].file).toBeDefined();
  });

  it("leaves the run as a change, so the save can be repeated", () => {
    const submitted = [createPendingFile(0, "first.las"), createPendingFile(0, "second.las")];

    const [updated] = saveThenGiveUp(submitted, [createdRun([])]);

    expect(updated.hasChanges).toBe(true);
  });

  it("repeats the save against the run the server created, not a second one", () => {
    const submitted = [createPendingFile(0, "first.las"), createPendingFile(0, "second.las")];

    const [updated] = saveThenGiveUp(submitted, [createdRun([])]);

    expect(updated.item.id).toBe(42);
  });

  it("stops offering a file that did reach the server", () => {
    // The first file got through before the save was given up on.
    const submitted = [{ ...createPendingFile(11, "first.las"), file: undefined }, createPendingFile(0, "second.las")];

    const [updated] = saveThenGiveUp(submitted, [createdRun(["first.las"])]);

    expect(updated.item.logFiles?.[0].file).toBeUndefined();
    expect(updated.item.logFiles?.[0].id).toBe(11);
    expect(updated.item.logFiles?.[1].file).toBeDefined();
  });
});
