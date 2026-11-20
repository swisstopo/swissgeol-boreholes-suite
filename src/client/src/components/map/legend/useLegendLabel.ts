import { useTranslation } from "react-i18next";
import { useCodelistDisplayValues } from "../../codelist.ts";
import { LegendLabel } from "./legendThemes.ts";

/**
 * Returns a function that gives the text of a legend label in the current language.
 */
export const useLegendLabel = () => {
  const { t } = useTranslation();
  const getCodelistDisplayValues = useCodelistDisplayValues();
  return (label: LegendLabel) =>
    label.kind === "codelist" ? getCodelistDisplayValues(label.codelistId).text : t(label.key);
};
