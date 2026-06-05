import { Codelist } from "../../../../api/generated";
import { FormErrors } from "../../../../components/form/form.ts";
import {
  buildErrorStructure,
  ensureDateOnly,
  parseFloatWithThousandsSeparator,
} from "../../../../components/form/formUtils.ts";
import { LogFile, LogRun } from "./logInterfaces.ts";

export const prepareLogRunForSubmit = (data: LogRun) => {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth)!;
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth)!;
  data.bitSize = parseFloatWithThousandsSeparator(data.bitSize)!;

  delete data.tmpId;
  delete data.conveyanceMethod;
  delete data.boreholeStatus;
  delete data.created;
  delete data.createdBy;
  delete data.updated;
  delete data.updatedBy;
  data.runDate = data?.runDate ? ensureDateOnly(data.runDate.toString()) : null;

  if (data.logFiles) {
    for (const file of data.logFiles) {
      delete file.tmpId;
      delete file.name;
      delete file.created;
      delete file.createdBy;
      delete file.updated;
      delete file.updatedBy;
    }
  }

  if (String(data.conveyanceMethodId) === "") data.conveyanceMethodId = null;
  if (String(data.boreholeStatusId) === "") data.boreholeStatusId = null;
};

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
