import { useTranslation } from "react-i18next";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.js";

/**
 * Extract the minimum and maximum depth of the casing elements from the casing object
 * @param {any} casing The casing with the casing elements
 * @returns {number, number} The minimum and maximum depth of the casing elements
 */
export const extractCasingDepth = casing => {
  var min = null;
  var max = null;
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

export const useGetCasingName = () => {
  const { t } = useTranslation();

  /**
   * Gets the name of the casing with the name of the completion; or if the item references an open borehole, it returns the open borehole string
   * @param {any} item An object that references a casing
   * @returns The name to be displayed
   */
  const getCasingNameWithCompletion = item => {
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
  const getCasingOptions = casings => {
    var options = [{ key: -1, name: t("openBorehole") }];
    casings
      .sort((a, b) => {
        if (a.name !== b.name) {
          return a.name < b.name ? -1 : 1;
        } else {
          return 0;
        }
      })
      .forEach(casing => {
        options.push({ key: casing.id, name: `${casing.completion.name} - ${casing.name}` });
      });
    return options;
  };

  return getCasingOptions;
};

/**
 * Prepares the casing data of an item that references a casing for submission
 * @param {any} data The form data to be prepared for submission
 * @returns {any} The updated form data
 */
export const prepareCasingDataForSubmit = data => {
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
