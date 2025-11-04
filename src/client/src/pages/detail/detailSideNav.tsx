import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Box, Stack } from "@mui/material";
import { SgcMenuItem } from "@swissgeol/ui-core-react";
import { BoreholeV2, useBoreholeStatusEditable } from "../../api/borehole.ts";
import { useAuth } from "../../auth/useBdmsAuth";
import { useBoreholeDataAvailability } from "../../hooks/useBoreholeDataAvailability.ts";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";
import { capitalizeFirstLetter } from "../../utils";
import { TabStatus } from "./form/workflow/workflow.ts";

interface DetailSideNavProps {
  borehole: BoreholeV2;
}

export const DetailSideNav = ({ borehole }: DetailSideNavProps) => {
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const { id } = useRequiredParams<{ id: string }>();
  const { data: canChangeStatus } = useBoreholeStatusEditable(parseInt(id));
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
    hasLogRuns,
  } = useBoreholeDataAvailability(borehole);

  useEffect(() => {
    if (id !== undefined) {
      setHydrogeologyIsVisible(location.pathname.startsWith(`/${id}/hydrogeology`));
    }
  }, [location, id]);

  if (!borehole.workflow) return null;

  const isReviewed = (tabKeys: Array<keyof TabStatus>) => {
    if (tabKeys.every(key => borehole.workflow?.reviewedTabs[key])) return "true";
    if (tabKeys.some(key => borehole.workflow?.reviewedTabs[key])) return "partial";
    return "false";
  };

  return (
    <Stack
      sx={{
        width: "250px",
        height: "100%",
        position: "relative",
      }}>
      <Stack
        sx={{
          overflow: "auto",
        }}>
        <Box>
          <SgcMenuItem
            active={location.pathname === `/${id}/location`}
            data-cy="location-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["location"])}
            onClick={() => {
              navigateTo({ path: `/${id}/location` });
            }}>
            {capitalizeFirstLetter(t("location"))}
          </SgcMenuItem>
          <SgcMenuItem
            active={location.pathname === `/${id}/borehole`}
            data-cy="borehole-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["general", "sections", "geometry"])}
            onClick={() => {
              navigateTo({ path: `/${id}/borehole` });
            }}>
            {capitalizeFirstLetter(t("borehole"))}{" "}
          </SgcMenuItem>
          <SgcMenuItem
            active={location.pathname.includes(`/${id}/stratigraphy`)}
            empty={!hasStratigraphy}
            isReviewed={
              !auth.anonymousModeEnabled && isReviewed(["lithology", "lithostratigraphy", "chronostratigraphy"])
            }
            data-cy="stratigraphy-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/stratigraphy` });
            }}>
            {capitalizeFirstLetter(t("stratigraphy"))}{" "}
          </SgcMenuItem>
          <SgcMenuItem
            active={location.pathname.includes(`/${id}/completion`)}
            empty={!hasCompletion}
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["casing", "instrumentation", "backfill"])}
            data-cy="completion-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/completion` });
            }}>
            {capitalizeFirstLetter(t("completion"))}{" "}
          </SgcMenuItem>
          <SgcMenuItem
            active={false}
            empty={!hasObservation}
            isReviewed={
              !auth.anonymousModeEnabled &&
              isReviewed(["waterIngress", "groundwaterLevelMeasurement", "hydrotest", "fieldMeasurement"])
            }
            data-cy="hydrogeology-menu-item"
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            {capitalizeFirstLetter(t("hydrogeology"))}
          </SgcMenuItem>
          {hydrogeologyIsVisible && (
            <>
              <SgcMenuItem
                active={!auth.anonymousModeEnabled && location.pathname === `/${id}/hydrogeology/wateringress`}
                child
                empty={!hasWaterIngress}
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["waterIngress"])}
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
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["groundwaterLevelMeasurement"])}
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
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["fieldMeasurement"])}
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
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["hydrotest"])}
                data-cy="hydrotest-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/hydrotest` });
                }}>
                {capitalizeFirstLetter(t("hydrotest"))}
              </SgcMenuItem>
            </>
          )}
          <SgcMenuItem
            active={location.pathname === `/${id}/log`}
            empty={!hasLogRuns}
            data-cy="log-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["log"])}
            onClick={() => {
              navigateTo({ path: `/${id}/log` });
            }}>
            {t("log")}
          </SgcMenuItem>
          <SgcMenuItem
            active={location.pathname === `/${id}/attachments`}
            empty={!hasAttachments}
            data-cy="attachments-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["profiles", "photos", "documents"])}
            onClick={() => {
              navigateTo({ path: `/${id}/attachments` });
            }}>
            {capitalizeFirstLetter(t("attachments"))}
          </SgcMenuItem>
          {!auth.anonymousModeEnabled && canChangeStatus && (
            <SgcMenuItem
              active={location.pathname === `/${id}/status`}
              data-cy="status-menu-item"
              onClick={() => {
                navigateTo({ path: `/${id}/status` });
              }}>
              {capitalizeFirstLetter(t("status"))}
            </SgcMenuItem>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
