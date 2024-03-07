import { useTranslation } from "react-i18next";

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
  return { min, max };
};

export const getCasingName = item => {
  const { t } = useTranslation();

  if (item?.isOpenBorehole) {
    return t("openBorehole");
  } else if (item?.casingId) {
    return item?.casing?.name;
  }
  return null;
};

export const getCasingOptions = casings => {
  const { t } = useTranslation();
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
      options.push({ key: casing.id, name: casing.name });
    });
  return options;
};

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
