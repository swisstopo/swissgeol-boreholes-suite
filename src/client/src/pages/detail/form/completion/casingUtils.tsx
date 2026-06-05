import { useTranslation } from "react-i18next";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { CasingDepth, CasingOption } from "./completionInterfaces.ts";

/**
 * Extract the minimum and maximum depth of the casing elements from the casing object
 */
export const extractCasingDepth = (casing: {
  casingElements?: { fromDepth?: number | null; toDepth?: number | null }[];
}): CasingDepth => {
  let min: number | null = null;
  let max: number | null = null;
  if (casing?.casingElements != null) {
    casing.casingElements.forEach(element => {
      if (element?.fromDepth != null && (min === null || element.fromDepth < min)) {
        min = element.fromDepth;
      }
      if (element?.toDepth != null && (max === null || element.toDepth > max)) {
        max = element.toDepth;
      }
    });
  }
  return { min: parseFloatWithThousandsSeparator(min), max: parseFloatWithThousandsSeparator(max) };
};

interface CasingReferenceItem {
  isOpenBorehole?: boolean;
  casingId?: number | null;
  casing?: {
    name?: string | null;
    completion?: { name?: string | null };
  };
}

export const useGetCasingName = () => {
  const { t } = useTranslation();

  /**
   * Gets the name of the casing with the name of the completion; or if the item references an open borehole, it returns the open borehole string
   */
  const getCasingNameWithCompletion = (item: CasingReferenceItem): string => {
    if (item?.isOpenBorehole) {
      return t("openBorehole");
    } else if (item?.casingId) {
      return `${item?.casing?.completion?.name} - ${item?.casing?.name}`;
    }
    return "";
  };

  return { getCasingNameWithCompletion };
};

export const useGetCasingOptions = () => {
  const { t } = useTranslation();
  /**
   * Get the available casings together with an open borehole option
   * @param {any[]} casings An array of casings
   * @returns An array of objects that contain the key and name of the available casings as well as the open borehole option
   */
  const getCasingOptions = (
    casings: { id?: number; name?: string | null; completion?: { name?: string | null } }[],
  ): CasingOption[] => {
    const options: CasingOption[] = [{ key: -1, name: t("openBorehole") }];
    casings
      .toSorted((a, b) => {
        if (a.name === b.name) {
          return 0;
        }
        return (a.name ?? "") < (b.name ?? "") ? -1 : 1;
      })
      .forEach(casing => {
        if (casing.id != null) {
          options.push({ key: casing.id, name: `${casing.completion?.name} - ${casing.name}` });
        }
      });
    return options;
  };

  return getCasingOptions;
};

interface CasingSubmitData {
  casingId?: number | string | null;
  isOpenBorehole?: boolean;
  casing?: unknown;
}

/**
 * Prepares the casing data of an item that references a casing for submission
 */
export const prepareCasingDataForSubmit = <T extends CasingSubmitData>(data: T): T => {
  switch (data.casingId) {
    case -1:
      data.isOpenBorehole = true;
      data.casingId = null;
      break;
    case "":
      data.casingId = null;
      data.isOpenBorehole = false;
      break;
    default:
      data.isOpenBorehole = false;
  }
  data.casing = null;
  return data;
};
