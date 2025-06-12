import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth";
import { ChildListItem, ParentListItem } from "../../components/styledComponents.ts";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const navigateTo = (path: string) => {
    if (path !== location.pathname) {
      navigate({ pathname: path, search: searchParams.toString() });
    }
  };

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
          <ParentListItem
            style={{ borderTop: "none" }}
            active={location.pathname === `/${id}/location`}
            onClick={() => {
              navigateTo(`/${id}/location`);
            }}>
            <Typography data-cy="location-menu-item">{capitalizeFirstLetter(t("location"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={location.pathname === `/${id}/borehole`}
            onClick={() => {
              navigateTo(`/${id}/borehole`);
            }}>
            <Typography data-cy="borehole-menu-item">{capitalizeFirstLetter(t("borehole"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={location.pathname.includes(`/${id}/stratigraphy`)}
            hasContent={hasStratigraphy}
            onClick={() => {
              navigateTo(`/${id}/stratigraphy`);
            }}>
            <Typography data-cy="stratigraphy-menu-item">{capitalizeFirstLetter(t("stratigraphy"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={location.pathname.includes(`/${id}/completion`)}
            hasContent={hasCompletion}
            onClick={() => {
              navigateTo(`/${id}/completion`);
            }}>
            <Typography data-cy="completion-menu-item">{capitalizeFirstLetter(t("completion"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={false}
            hasContent={hasObservation}
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            <Typography data-cy="hydrogeology-menu-item">{capitalizeFirstLetter(t("hydrogeology"))}</Typography>
          </ParentListItem>
          {hydrogeologyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/wateringress`}
                hasContent={hasWaterIngress}
                onClick={() => {
                  navigateTo(`/${id}/hydrogeology/wateringress`);
                }}>
                <Typography data-cy="wateringress-menu-item">{capitalizeFirstLetter(t("waterIngress"))}</Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                hasContent={hasGroundwaterLevelMeasurement}
                onClick={() => {
                  navigateTo(`/${id}/hydrogeology/groundwaterlevelmeasurement`);
                }}>
                <Typography data-cy="groundwaterlevelmeasurement-menu-item">
                  {capitalizeFirstLetter(t("groundwaterLevelMeasurement"))}
                </Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                hasContent={hasFieldMeasurement}
                onClick={() => {
                  navigateTo(`/${id}/hydrogeology/fieldmeasurement`);
                }}>
                <Typography data-cy="fieldmeasurement-menu-item">
                  {capitalizeFirstLetter(t("fieldMeasurement"))}
                </Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/hydrotest`}
                hasContent={hasHydroTest}
                onClick={() => {
                  navigateTo(`/${id}/hydrogeology/hydrotest`);
                }}>
                <Typography data-cy="hydrotest-menu-item">{capitalizeFirstLetter(t("hydrotest"))}</Typography>
              </ChildListItem>
            </>
          )}
          {!auth.anonymousModeEnabled && (
            <>
              <ParentListItem
                active={location.pathname === `/${id}/attachments`}
                hasContent={hasAttachments}
                onClick={() => {
                  navigateTo(`/${id}/attachments`);
                }}>
                <Typography data-cy="attachments-menu-item">{capitalizeFirstLetter(t("attachments"))}</Typography>
              </ParentListItem>
              <ParentListItem
                active={location.pathname === `/${id}/status`}
                style={{ borderBottom: `1px solid ${theme.palette.border.light}` }}
                onClick={() => {
                  navigateTo(`/${id}/status`);
                }}>
                <Typography data-cy="status-menu-item">{capitalizeFirstLetter(t("flowPublicationStatus"))}</Typography>
              </ParentListItem>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
