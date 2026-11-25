import { useTranslation } from "react-i18next";
import { capitalizeFirstLetter } from "../../../utils.ts";
import { useCodelistDisplayValues } from "../../codelist.ts";
import { LegendLabel } from "./legendThemes.ts";

/**
 * Returns a function that gives the text of a legend label in the current language. The text starts with a capital
 * letter, as in the design, also where the codelist text is lower case (e.g. "belastete Standorte").
 */
export const useLegendLabel = () => {
  const { t } = useTranslation();
  const getCodelistDisplayValues = useCodelistDisplayValues();
  const getText = (label: LegendLabel) => {
    if (label.kind === "codelist") return getCodelistDisplayValues(label.codelistId).text;
    return label.values ? t(label.key, label.values) : t(label.key);
  };
  return (label: LegendLabel) => capitalizeFirstLetter(getText(label));
};
