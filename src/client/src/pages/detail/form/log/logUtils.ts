import { Codelist } from "../../../../api/generated";
import { FormErrors } from "../../../../components/form/form.ts";
import {
  buildErrorStructure,
  ensureDateOnly,
  parseFloatWithThousandsSeparator,
} from "../../../../components/form/formUtils.ts";
import { LogFile, LogRun, LogRunChangeTracker } from "./logInterfaces.ts";

/**
 * Projects a log run onto what the API accepts, dropping the fields the client keeps for
 * itself and the ones the server owns.
 *
 * The result is a copy. The run it is built from stays in the panel's state, where `tmpId`
 * identifies the run the table and the modal act on, so stripping those fields off the
 * original would leave a run nothing can select any more.
 * @param data The log run as the form holds it.
 * @returns The payload to send.
 */
export const prepareLogRunForSubmit = (data: LogRun): LogRun => {
  const payload: LogRun = {
    ...data,
    fromDepth: parseFloatWithThousandsSeparator(data.fromDepth)!,
    toDepth: parseFloatWithThousandsSeparator(data.toDepth)!,
    bitSize: parseFloatWithThousandsSeparator(data.bitSize)!,
    runDate: data?.runDate ? ensureDateOnly(data.runDate.toString()) : null,
    logFiles: data.logFiles?.map(prepareLogFileForSubmit),
  };

  delete payload.tmpId;
  delete payload.conveyanceMethod;
  delete payload.boreholeStatus;
  delete payload.created;
  delete payload.createdBy;
  delete payload.updated;
  delete payload.updatedBy;

  if (String(payload.conveyanceMethodId) === "") payload.conveyanceMethodId = null;
  if (String(payload.boreholeStatusId) === "") payload.boreholeStatusId = null;

  return payload;
};

const prepareLogFileForSubmit = (data: LogFile): LogFile => {
  const payload: LogFile = { ...data };

  delete payload.tmpId;
  delete payload.name;
  delete payload.created;
  delete payload.createdBy;
  delete payload.updated;
  delete payload.updatedBy;

  return payload;
};

/**
 * Records which of a run's files reached the server, so a save that was given up on part way
 * through does not send them a second time.
 *
 * The submitted files are the payload built by {@link prepareLogRunForSubmit}, in the same
 * order as the run's own. A file that no longer carries its blob has been stored, and takes
 * the id the server gave it.
 * @param runs The panel's runs.
 * @param tmpId The run that was submitted.
 * @param submittedFiles The payload's files after the attempt.
 * @returns The runs, with the stored files marked.
 */
export const applyUploadedFiles = (
  runs: LogRunChangeTracker[],
  tmpId: string | undefined,
  submittedFiles: LogFile[] | undefined,
): LogRunChangeTracker[] => {
  if (tmpId === undefined || submittedFiles === undefined) return runs;

  return runs.map(entry => {
    if (entry.item.tmpId !== tmpId || !entry.item.logFiles) return entry;

    return {
      ...entry,
      item: {
        ...entry.item,
        logFiles: entry.item.logFiles.map((file, index) => {
          const submitted = submittedFiles[index];
          if (!submitted || submitted.file) return file;
          return { ...file, id: submitted.id, file: undefined };
        }),
      },
    };
  });
};

/**
 * The server replaces white space in a stored file name, so names are compared the way it
 * would have stored them.
 */
const storedFileName = (name: string): string => name.replaceAll(" ", "_");

/**
 * Reconciles the panel's runs with what the server actually holds.
 *
 * A cancelled upload can still have reached the server, which stores the file and answers
 * nobody. The client cannot tell that from an upload that never arrived, so it asks: a pending
 * file the run already holds by name is one that got through, and it stops being pending.
 * @param runs The panel's runs.
 * @param storedRuns The log runs as the server holds them.
 * @returns The runs, with files the server already has marked as stored.
 */
export const applyStoredFiles = (runs: LogRunChangeTracker[], storedRuns: LogRun[]): LogRunChangeTracker[] =>
  runs.map(entry => {
    const stored = storedRuns.find(run => run.id === entry.item.id);
    if (entry.item.id === 0 || stored === undefined || !entry.item.logFiles) return entry;

    let anyStored = false;
    const logFiles = entry.item.logFiles.map(file => {
      const name = file.name;
      if (!file.file || name === undefined) return file;

      const match = stored.logFiles?.find(storedFile => storedFile.name === storedFileName(name));
      if (match === undefined) return file;

      anyStored = true;
      return { ...file, id: match.id, file: undefined };
    });

    return anyStored ? { ...entry, item: { ...entry.item, logFiles } } : entry;
  });

export const getServiceOrToolArray = (
  logFiles: LogFile[] | undefined,
  codelists: Codelist[],
): (string | undefined)[] => {
  if (!logFiles) return [];
  return logFiles
    .flatMap(file => file.toolTypeCodelistIds)
    .filter((id, index, array) => array.indexOf(id) === index) // get unique ids
    .map(id => codelists.find((d: Codelist) => d.id === id)?.code ?? "");
};

export const validateRunNumber = (values: LogRun, errors: FormErrors, runs: LogRun[]) => {
  const runNumber = values.runNumber;
  if (!runNumber) {
    errors.runNumber = { type: "required", message: "required" };
  }
  if (runs.some(r => r.runNumber === runNumber && r.tmpId !== values.tmpId)) {
    errors.runNumber = { type: "manual", message: "mustBeUnique" };
  }
};

export const validateFiles = (values: LogRun, errors: FormErrors) => {
  if (!values.logFiles || values.logFiles.length === 0) return;
  const flatErrors: Record<string, string> = {};
  const seenNames = new Set<string>();
  for (const [idx, file] of values.logFiles.entries()) {
    if (!file) return;
    const missingName = !file.name || file.name.trim() === "";
    if (missingName) {
      flatErrors[`logFiles.${idx}.name`] = "required";
    } else {
      const lowerName = file.name!.toLowerCase();
      if (seenNames.has(lowerName)) {
        flatErrors[`logFiles.${idx}.name`] = "mustBeUnique";
      } else {
        seenNames.add(lowerName);
      }
    }
  }
  if (Object.keys(flatErrors).length > 0) {
    buildErrorStructure(flatErrors, errors, "required");
  }
};

export const getFileExtension = (fileName?: string, placeholder?: string): string => {
  const extension = fileName?.split(".").pop();
  return extension ? extension.toLowerCase() : (placeholder ?? "");
};

interface LogFileCsvInfo {
  requiredFilesPerRun: Record<string, string[]>;
}

export const buildFileName = (cols: string[], nameIndex: number, extensionIndex: number): string => {
  const name = cols[nameIndex]?.trim() ?? "";
  const ext = extensionIndex >= 0 ? (cols[extensionIndex]?.trim() ?? "") : "";
  return ext ? `${name}.${ext}` : name;
};

export const parseLogFilesCsv = async (csvFile: File): Promise<LogFileCsvInfo> => {
  const text = await csvFile.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { requiredFilesPerRun: {} };

  const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
  const runNumberIndex = headers.indexOf("runnumber");
  if (runNumberIndex === -1) return { requiredFilesPerRun: {} };

  const nameIndex = headers.indexOf("name");
  const extensionIndex = headers.indexOf("extension");
  const result: Record<string, string[]> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const runNumber = cols[runNumberIndex]?.trim();
    if (!runNumber) continue;
    result[runNumber] ??= [];
    if (nameIndex >= 0) {
      const fileName = buildFileName(cols, nameIndex, extensionIndex);
      if (fileName) result[runNumber].push(fileName);
    }
  }
  return { requiredFilesPerRun: result };
};
