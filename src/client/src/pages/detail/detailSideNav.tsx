import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth";
import { ChildListItem, ParentListItem } from "../../components/styledComponents.ts";
import { capitalizeFirstLetter } from "../../utils";

export const DetailSideNav = () => {
  const [stratigraphyIsVisible, setStratigraphyIsVisible] = useState(false);
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const auth = useAuth();
  const history = useHistory();

  useEffect(() => {
    setStratigraphyIsVisible(location.pathname.startsWith(`/${id}/stratigraphy`));
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
          <ParentListItem
            style={{ borderTop: "none" }}
            active={location.pathname === `/${id}/location`}
            onClick={() => {
              history.push(`/${id}/location`);
            }}>
            <Typography data-cy="location-menu-item">{capitalizeFirstLetter(t("location"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={location.pathname === `/${id}/borehole`}
            onClick={() => {
              history.push(`/${id}/borehole`);
            }}>
            <Typography data-cy="borehole-menu-item">{capitalizeFirstLetter(t("borehole"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={false}
            onClick={() => {
              setStratigraphyIsVisible(!stratigraphyIsVisible);
            }}>
            <Typography data-cy="stratigraphy-menu-item">{capitalizeFirstLetter(t("stratigraphy"))}</Typography>
          </ParentListItem>
          {stratigraphyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/lithology`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/lithology`);
                }}>
                <Typography data-cy="lithology-menu-item">{capitalizeFirstLetter(t("lithology"))}</Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/chronostratigraphy`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/chronostratigraphy`);
                }}>
                <Typography data-cy="chronostratigraphy-menu-item">
                  {capitalizeFirstLetter(t("chronostratigraphy"))}
                </Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/lithostratigraphy`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/lithostratigraphy`);
                }}>
                <Typography data-cy="lithostratigraphy-menu-item">
                  {capitalizeFirstLetter(t("lithostratigraphy"))}
                </Typography>
              </ChildListItem>
            </>
          )}
          <ParentListItem
            active={location.pathname.includes(`/${id}/completion`)}
            onClick={() => {
              history.push(`/${id}/completion`);
            }}>
            <Typography data-cy="completion-menu-item">{capitalizeFirstLetter(t("completion"))}</Typography>
          </ParentListItem>
          <ParentListItem
            active={false}
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            <Typography data-cy="hydrogeology-menu-item">{capitalizeFirstLetter(t("hydrogeology"))}</Typography>
          </ParentListItem>
          {hydrogeologyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/wateringress`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/wateringress`);
                }}>
                <Typography data-cy="wateringress-menu-item">{capitalizeFirstLetter(t("waterIngress"))}</Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/groundwaterlevelmeasurement`);
                }}>
                <Typography data-cy="groundwaterlevelmeasurement-menu-item">
                  {capitalizeFirstLetter(t("groundwaterLevelMeasurement"))}
                </Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/fieldmeasurement`);
                }}>
                <Typography data-cy="fieldmeasurement-menu-item">
                  {capitalizeFirstLetter(t("fieldMeasurement"))}
                </Typography>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/hydrotest`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/hydrotest`);
                }}>
                <Typography data-cy="hydrotest-menu-item">{capitalizeFirstLetter(t("hydrotest"))}</Typography>
              </ChildListItem>
            </>
          )}
          {!auth.anonymousModeEnabled && (
            <>
              <ParentListItem
                active={location.pathname === `/${id}/attachments`}
                onClick={() => {
                  history.push(`/${id}/attachments`);
                }}>
                <Typography data-cy="attachments-menu-item">{capitalizeFirstLetter(t("attachments"))}</Typography>
              </ParentListItem>
              <ParentListItem
                active={location.pathname === `/${id}/status`}
                style={{ borderBottom: `1px solid ${theme.palette.border.light}` }}
                onClick={() => {
                  history.push(`/${id}/status`);
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
