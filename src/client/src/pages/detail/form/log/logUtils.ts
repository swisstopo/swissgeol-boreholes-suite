import { Codelist } from "../../../../components/codelist.ts";
import { FormErrors } from "../../../../components/form/form.ts";
import {
  buildErrorStructure,
  ensureDateOnly,
  parseFloatWithThousandsSeparator,
} from "../../../../components/form/formUtils.ts";
import { LogRun, TmpLogRun } from "./log.ts";

export const prepareLogRunForSubmit = (data: TmpLogRun) => {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth)!;
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth)!;
  data.bitSize = parseFloatWithThousandsSeparator(data.bitSize)!;

  delete data.conveyanceMethod;
  delete data.boreholeStatus;
  delete data.created;
  delete data.createdBy;
  delete data.updated;
  delete data.updatedBy;
  data.runDate = data?.runDate ? ensureDateOnly(data.runDate.toString()) : null;

  if (data.logFiles) {
    for (const f of data.logFiles) {
      delete f.tmpId;
    }
  }

  if (String(data.conveyanceMethodId) === "") data.conveyanceMethodId = null;
  if (String(data.boreholeStatusId) === "") data.boreholeStatusId = null;
};

export const getServiceOrToolArray = (logRun: LogRun, codelists: Codelist[]): (string | undefined)[] => {
  if (!logRun?.logFiles) return [];
  return logRun.logFiles
    .flatMap(file => file.toolTypeCodelistIds)
    .filter((id, index, array) => array.indexOf(id) === index) // get unique ids
    .map(id => codelists.find((d: Codelist) => d.id === id)?.code ?? "");
};

export const validateRunNumber = (values: TmpLogRun, errors: FormErrors, runs: TmpLogRun[]) => {
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
  for (const [idx, file] of values.logFiles.entries()) {
    if (!file) return;
    const missingName = !file.name || file.name.trim() === "";
    const missingType = !file.fileType || file.fileType.trim() === "";
    if (missingName || missingType) {
      flatErrors[`logFiles.${idx}.name`] = "required";
    }
  }
  if (Object.keys(flatErrors).length > 0) {
    buildErrorStructure(flatErrors, errors, "required");
  }
};
