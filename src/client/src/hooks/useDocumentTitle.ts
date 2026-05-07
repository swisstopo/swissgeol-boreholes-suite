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
    const segments = location.pathname.split("/").filter(Boolean);
    let detailUrlSegment = segments[1]; // URL structure: /:id/:tab
    if (detailUrlSegment === "hydrogeology") {
      detailUrlSegment = segments[2]; // URL structure: /:id/:hydrogeology/:tab
    }
    const translationKey = routeToTranslationKey[detailUrlSegment] ?? detailUrlSegment;
    const tabName = translationKey ? capitalizeFirstLetter(t(translationKey)) : undefined;
    if (boreholeName && tabName) return `${boreholeName} - ${tabName}`;
    if (boreholeName) return boreholeName;
    return tabName;
  }, [boreholeName, location.pathname, t]);

  useEffect(() => {
    console.log(pageTitle);
    document.title = pageTitle ? `${pageTitle} | ${defaultTitle}` : defaultTitle;
  }, [pageTitle, defaultTitle]);

  useEffect(() => {
    return () => {
      document.title = defaultTitle;
    };
  }, []);
};
