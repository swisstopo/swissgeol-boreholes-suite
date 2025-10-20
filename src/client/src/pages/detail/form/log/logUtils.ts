import { Codelist } from "../../../../components/codelist.ts";
import { FormErrors } from "../../../../components/form/form.ts";
import { ensureDateOnly, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { LogRun, TmpLogRun } from "./log.ts";

export const prepareLogRunForSubmit = (data: TmpLogRun) => {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth)!;
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth)!;
  data.bitSize = parseFloatWithThousandsSeparator(data.bitSize)!;

  delete data.conveyanceMethod;
  delete data.boreholeStatus;
  delete data.updated;
  delete data.created;
  data.runDate = data?.runDate ? ensureDateOnly(data.runDate.toString()) : null;

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

export const validateRunNumber = (values: LogRun, errors: FormErrors, runs: TmpLogRun[]) => {
  const runNumber = values.runNumber;
  if (!runNumber) {
    errors.runNumber = { type: "required", message: "required" };
  }
  if (runs.filter(r => r.runNumber === runNumber && r.tmpId !== String(values.id)).length > 0) {
    errors.runNumber = { type: "manual", message: "mustBeUnique" };
  }
};
