import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Box, Stack } from "@mui/material";
import { SgcMenuItem } from "@swissgeol/ui-core-react";
import { useBoreholeManageable } from "../../api/borehole.ts";
import { Borehole } from "../../api/generated";
import { useAuth } from "../../auth/useBoreholesAuth.tsx";
import { useBoreholeDataAvailability } from "../../hooks/useBoreholeDataAvailability.ts";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";
import { useCapitalizedTranslation } from "../../hooks/useCapitalizedTranslation.ts";
import { useRequiredId } from "../../hooks/useRequiredId.ts";
import { TabStatus } from "./form/workflow/workflow.ts";

interface DetailSideNavProps {
  borehole: Borehole;
}

export const DetailSideNav = ({ borehole }: DetailSideNavProps) => {
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const id = useRequiredId();
  const { data: canManage } = useBoreholeManageable(id);
  const location = useLocation();
  const { t } = useTranslation();
  const ct = useCapitalizedTranslation();
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
    if (tabKeys.every(key => borehole.workflow?.reviewedTabs?.[key])) return "true";
    if (tabKeys.some(key => borehole.workflow?.reviewedTabs?.[key])) return "partial";
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
            isActive={location.pathname === `/${id}/identifiers`}
            data-cy="identifiers-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["identifiers"])}
            onClick={() => {
              navigateTo({ path: `/${id}/identifiers` });
            }}>
            {ct("ids")}
          </SgcMenuItem>
          <SgcMenuItem
            isActive={location.pathname === `/${id}/location`}
            data-cy="location-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["location"])}
            onClick={() => {
              navigateTo({ path: `/${id}/location` });
            }}>
            {ct("location")}
          </SgcMenuItem>
          <SgcMenuItem
            isActive={location.pathname === `/${id}/borehole`}
            data-cy="borehole-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["general", "sections", "geometry"])}
            onClick={() => {
              navigateTo({ path: `/${id}/borehole` });
            }}>
            {ct("borehole")}
          </SgcMenuItem>
          <SgcMenuItem
            isActive={location.pathname.includes(`/${id}/stratigraphy`)}
            isEmpty={!hasStratigraphy}
            isReviewed={
              !auth.anonymousModeEnabled && isReviewed(["lithology", "lithostratigraphy", "chronostratigraphy"])
            }
            data-cy="stratigraphy-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/stratigraphy` });
            }}>
            {ct("stratigraphy")}
          </SgcMenuItem>
          <SgcMenuItem
            isActive={location.pathname.includes(`/${id}/completion`)}
            isEmpty={!hasCompletion}
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["casing", "instrumentation", "backfill"])}
            data-cy="completion-menu-item"
            onClick={() => {
              navigateTo({ path: `/${id}/completion` });
            }}>
            {ct("completion")}
          </SgcMenuItem>
          <SgcMenuItem
            isActive={false}
            isEmpty={!hasObservation}
            isReviewed={
              !auth.anonymousModeEnabled &&
              isReviewed(["waterIngress", "groundwaterLevelMeasurement", "hydrotest", "fieldMeasurement"])
            }
            data-cy="hydrogeology-menu-item"
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            {ct("hydrogeology")}
          </SgcMenuItem>
          {hydrogeologyIsVisible && (
            <>
              <SgcMenuItem
                isActive={!auth.anonymousModeEnabled && location.pathname === `/${id}/hydrogeology/wateringress`}
                isChild
                isEmpty={!hasWaterIngress}
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["waterIngress"])}
                data-cy="wateringress-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/wateringress` });
                }}>
                {ct("waterIngress")}
              </SgcMenuItem>
              <SgcMenuItem
                isActive={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                isChild
                isEmpty={!hasGroundwaterLevelMeasurement}
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["groundwaterLevelMeasurement"])}
                data-cy="groundwaterlevelmeasurement-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/groundwaterlevelmeasurement` });
                }}>
                {ct("groundwaterLevelMeasurement")}
              </SgcMenuItem>
              <SgcMenuItem
                isActive={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                isChild
                isEmpty={!hasFieldMeasurement}
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["fieldMeasurement"])}
                data-cy="fieldmeasurement-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/fieldmeasurement` });
                }}>
                {ct("fieldMeasurement")}
              </SgcMenuItem>
              <SgcMenuItem
                isActive={location.pathname === `/${id}/hydrogeology/hydrotest`}
                isChild
                isEmpty={!hasHydroTest}
                isReviewed={!auth.anonymousModeEnabled && isReviewed(["hydrotest"])}
                data-cy="hydrotest-menu-item"
                onClick={() => {
                  navigateTo({ path: `/${id}/hydrogeology/hydrotest` });
                }}>
                {ct("hydrotest")}
              </SgcMenuItem>
            </>
          )}
          <SgcMenuItem
            isActive={location.pathname === `/${id}/log`}
            isEmpty={!hasLogRuns}
            data-cy="log-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["log"])}
            onClick={() => {
              navigateTo({ path: `/${id}/log` });
            }}>
            {t("log")}
          </SgcMenuItem>
          <SgcMenuItem
            isActive={location.pathname === `/${id}/attachments`}
            isEmpty={!hasAttachments}
            data-cy="attachments-menu-item"
            isReviewed={!auth.anonymousModeEnabled && isReviewed(["profiles", "photos", "documents"])}
            onClick={() => {
              navigateTo({ path: `/${id}/attachments` });
            }}>
            {ct("attachments")}
          </SgcMenuItem>
          {!auth.anonymousModeEnabled && canManage && (
            <SgcMenuItem
              isActive={location.pathname === `/${id}/status`}
              data-cy="status-menu-item"
              onClick={() => {
                navigateTo({ path: `/${id}/status` });
              }}>
              {ct("status")}
            </SgcMenuItem>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
