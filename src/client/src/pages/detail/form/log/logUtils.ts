import { Codelist } from "../../../../components/codelist.ts";
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
