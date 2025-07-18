import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { SgcMenuItem } from "@swissgeol/ui-core-react";
import { BoreholeV2 } from "../../api/borehole.ts";
import { useAuth } from "../../auth/useBdmsAuth";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";
import { capitalizeFirstLetter } from "../../utils";
import { ObservationType } from "./form/hydrogeology/Observation.ts";

interface DetailSideNavProps {
  borehole: BoreholeV2;
}

export const DetailSideNav = ({ borehole }: DetailSideNavProps) => {
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const { id } = useRequiredParams<{ id: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const auth = useAuth();
  const { navigateTo } = useBoreholesNavigate();

  const {
    hasStratigraphy,
    hasCompletion,
    hasObservation,
    hasWaterIngress,
    hasGroundwaterLevelMeasurement,
    hasHydroTest,
    hasFieldMeasurement,
    hasAttachments,
  } = useMemo(() => {
    const hasStratigraphy = (borehole.stratigraphies?.length ?? 0) > 0;
    const hasCompletion = (borehole.completions?.length ?? 0) > 0;
    const hasObservation = (borehole.observations?.length ?? 0) > 0;
    const hasWaterIngress =
      hasObservation && (borehole.observations?.some(obs => obs.type === ObservationType.waterIngress) ?? false);
    const hasGroundwaterLevelMeasurement =
      hasObservation &&
      (borehole.observations?.some(obs => obs.type === ObservationType.groundwaterLevelMeasurement) ?? false);
    const hasHydroTest =
      hasObservation && (borehole.observations?.some(obs => obs.type === ObservationType.hydrotest) ?? false);
    const hasFieldMeasurement =
      hasObservation && (borehole.observations?.some(obs => obs.type === ObservationType.fieldMeasurement) ?? false);
    const hasBoreholeFiles = (borehole.boreholeFiles?.length ?? 0) > 0;
    const hasPhotos = (borehole.photos?.length ?? 0) > 0;
    const hasAttachments = hasBoreholeFiles || hasPhotos;

    return {
      hasStratigraphy,
      hasCompletion,
      hasObservation,
      hasWaterIngress,
      hasGroundwaterLevelMeasurement,
      hasHydroTest,
      hasFieldMeasurement,
      hasAttachments,
    };
  }, [borehole]);

  useEffect(() => {
    setHydrogeologyIsVisible(location.pathname.startsWith(`/${id}/hydrogeology`));
  }, [location, id]);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        width: "250px",
        height: "100%",
        position: "relative",
      }}>
      <Box
        key="sb-em-2"
        style={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}>
        <Box>
          <SgcMenuItem
            active={location.pathname === `/${id}/location`}
            data-cy="location-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/location` });
            }}>
            {capitalizeFirstLetter(t("location"))}{" "}
          </SgcMenuItem>

          <SgcMenuItem
            active={location.pathname === `/${id}/borehole`}
            data-cy="borehole-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/borehole` });
            }}>
            {capitalizeFirstLetter(t("borehole"))}{" "}
          </SgcMenuItem>

          <SgcMenuItem
            active={location.pathname.includes(`/${id}/stratigraphy`)}
            empty={!hasStratigraphy}
            data-cy="stratigraphy-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/stratigraphy` });
            }}>
            {capitalizeFirstLetter(t("stratigraphy"))}{" "}
          </SgcMenuItem>

          <SgcMenuItem
            active={location.pathname.includes(`/${id}/completion`)}
            empty={!hasCompletion}
            data-cy="completion-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/completion` });
            }}>
            {capitalizeFirstLetter(t("completion"))}{" "}
          </SgcMenuItem>
          <SgcMenuItem
            active={false}
            empty={!hasObservation}
            data-cy="hydrogeology-menu-item"
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            {capitalizeFirstLetter(t("hydrogeology"))}
          </SgcMenuItem>
          {hydrogeologyIsVisible && (
            <>
              <SgcMenuItem
                active={location.pathname === `/${id}/hydrogeology/wateringress`}
                child
                empty={!hasWaterIngress}
                data-cy="wateringress-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/wateringress` });
                }}>
                {capitalizeFirstLetter(t("waterIngress"))}
              </SgcMenuItem>
              <SgcMenuItem
                active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                child
                empty={!hasGroundwaterLevelMeasurement}
                data-cy="groundwaterlevelmeasurement-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/groundwaterlevelmeasurement` });
                }}>
                {capitalizeFirstLetter(t("groundwaterLevelMeasurement"))}
              </SgcMenuItem>
              <SgcMenuItem
                active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                child
                empty={!hasFieldMeasurement}
                data-cy="fieldmeasurement-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/fieldmeasurement` });
                }}>
                {capitalizeFirstLetter(t("fieldMeasurement"))}
              </SgcMenuItem>
              <SgcMenuItem
                active={location.pathname === `/${id}/hydrogeology/hydrotest`}
                child
                empty={!hasHydroTest}
                data-cy="hydrotest-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/hydrotest` });
                }}>
                {capitalizeFirstLetter(t("hydrotest"))}
              </SgcMenuItem>
            </>
          )}
          {!auth.anonymousModeEnabled && (
            <>
              <SgcMenuItem
                active={location.pathname === `/${id}/attachments`}
                empty={!hasAttachments}
                data-cy="attachments-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/attachments` });
                }}>
                {capitalizeFirstLetter(t("attachments"))}
              </SgcMenuItem>
              <SgcMenuItem
                active={location.pathname === `/${id}/status`}
                data-cy="status-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/status` });
                }}>
                {capitalizeFirstLetter(t("status"))}
              </SgcMenuItem>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
