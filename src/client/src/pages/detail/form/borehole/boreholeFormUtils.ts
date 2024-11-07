import { parseFloatWithThousandsSeparator } from "../../../../components/legacyComponents/formUtils.ts";
import { BoreholeFormInputs } from "./boreholePanelInterfaces.ts";

export const prepareBoreholeDataForSubmit = (formInputs: BoreholeFormInputs) => {
  const data = { ...formInputs };
  const parseValueIfNotNull = (value: string | number | null) =>
    value ? parseFloatWithThousandsSeparator(String(value)) : null;
  data.totalDepth = parseValueIfNotNull(data?.totalDepth);
  data.topBedrockFreshMd = parseValueIfNotNull(data?.topBedrockFreshMd);
  data.topBedrockWeatheredMd = parseValueIfNotNull(data?.topBedrockWeatheredMd);
  data.hasGroundwater = data?.hasGroundwater === 1 ? true : data?.hasGroundwater === 0 ? false : null;

  return data;
};
