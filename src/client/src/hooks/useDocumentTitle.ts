import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { capitalizeFirstLetter } from "../utils";

const routeToTranslationKey: Record<string, string> = {
  identifiers: "ids",
  wateringress: "waterIngress",
  groundwaterlevelmeasurement: "groundwaterLevelMeasurement",
  fieldmeasurement: "fieldMeasurement",
  hydrotest: "hydrotest",
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
    let detailUrlSegment = segments[1]; // URL structure: /boreholes/:id/:tab
    if (detailUrlSegment === "hydrogeology") {
      detailUrlSegment = segments[2]; // URL structure: /boreholes/:id/:hydrogeology/:tab
    }
    const translationKey = routeToTranslationKey[detailUrlSegment] ?? detailUrlSegment;
    const tabName = translationKey ? capitalizeFirstLetter(t(translationKey)) : undefined;
    return tabName ? `${boreholeName} - ${tabName}` : boreholeName;
  }, [boreholeName, location.pathname, t]);

  useEffect(() => {
    document.title = `${pageTitle} | ${defaultTitle}`;
  }, [pageTitle, defaultTitle]);

  useEffect(() => {
    return () => {
      document.title = defaultTitle;
    };
  }, []);
};
