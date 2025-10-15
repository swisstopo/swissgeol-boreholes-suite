import { Codelist } from "../../../../components/codelist.ts";
import { FormErrors } from "../../../../components/form/form.ts";
import { ensureDatetime, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { LogRun } from "./log.ts";

export const preparelogRunForSubmit = (data: LogRun) => {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth)!;
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth)!;
  data.bitSize = parseFloatWithThousandsSeparator(data.bitSize)!;

  console.log(data.bitSize);

  delete data.conveyanceMethod;
  delete data.boreholeStatus;

  delete data.logFiles; // logFiles are managed separately
  data.runDate = data?.runDate ? ensureDatetime(data.runDate.toString()) : null;

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

export const validateRunNumber = (values: LogRun, errors: FormErrors) => {
  if (!values.runNumber) {
    errors.runNumber = { type: "required", message: "required" };
  }
};
