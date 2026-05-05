import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { capitalizeFirstLetter } from "../utils";

const routeToTranslationKey: Record<string, string> = {
  identifiers: "ids",
  location: "location",
  borehole: "borehole",
  stratigraphy: "stratigraphy",
  completion: "completion",
  wateringress: "waterIngress",
  groundwaterlevelmeasurement: "groundwaterLevelMeasurement",
  fieldmeasurement: "fieldMeasurement",
  hydrotest: "hydrotest",
  log: "log",
  attachments: "attachments",
  status: "status",
};

/**
 * Sets the document title to include the borehole name and the current tab name.
 * Resets to the default title on unmount.
 */
export const useBoreholeDocumentTitle = (boreholeName: string | undefined) => {
  const { t } = useTranslation();
  const location = useLocation();

  const defaultTitle = "swissgeol boreholes";

  const pageTitle = useMemo(() => {
    if (!boreholeName) return undefined;
    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const translationKey = routeToTranslationKey[lastSegment];
    const tabName = translationKey ? capitalizeFirstLetter(t(translationKey)) : undefined;
    return tabName ? `${boreholeName} - ${tabName}` : boreholeName;
  }, [boreholeName, location.pathname, t]);

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${defaultTitle}` : defaultTitle;
    return () => {
      document.title = defaultTitle;
    };
  }, [pageTitle, defaultTitle]);
};
