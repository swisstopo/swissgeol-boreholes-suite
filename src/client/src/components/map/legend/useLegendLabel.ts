import { useTranslation } from "react-i18next";
import { useCodelistDisplayValues } from "../../codelist.ts";
import { LegendLabel } from "./legendThemes.ts";

/**
 * Returns a function that gives the text of a legend label in the current language.
 */
export const useLegendLabel = () => {
  const { t } = useTranslation();
  const getCodelistDisplayValues = useCodelistDisplayValues();
  return (label: LegendLabel) => {
    if (label.kind === "codelist") return getCodelistDisplayValues(label.codelistId).text;
    return label.values ? t(label.key, label.values) : t(label.key);
  };
};
