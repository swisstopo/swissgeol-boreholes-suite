import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, withRouter } from "react-router-dom";
import { List } from "semantic-ui-react";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { theme } from "../../AppTheme.ts";
import { Typography } from "@mui/material";
import { capitalizeFirstLetter } from "../../utils";

/**
 * A component that renders the side navigation for a borehole detail. The component is used without explicitly passing props.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.borehole - The borehole object containing data and fetching status, provided by react redux state.
 * @param {Object} props.match - The match object containing the URL parameters.
 * @param {Object} props.history - The history object from `withRouter` to navigate between routes.
 * @returns {JSX.Element | null} The rendered `DetailSideNav` component.
 */

const DetailSideNav = ({ borehole, history, match }) => {
  const [stratigraphyIsVisible, setStratigraphyIsVisible] = useState(false);
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const id = match?.params?.id;
  const env = import.meta.env;
  const isAnonymousModeEnabled = env.VITE_ANONYMOUS_MODE_ENABLED === "true";

  const ParentListItem = styled(ListItem)(({ active }) => ({
    padding: "1em",
    display: "flex",
    height: "40px",
    cursor: "pointer",
    paddingLeft: "35.5px",
    color: active ? theme.palette.error.main : "",
    borderTop: `1px solid ${theme.palette.boxShadow}`,
    borderLeft: active ? `0.25em solid ${theme.palette.error.main}` : null,
    "&:hover": {
      backgroundColor: theme.palette.hover.main,
    },
  }));

  const ChildListItem = styled(ParentListItem)(() => ({
    paddingLeft: "50px !important",
  }));

  useEffect(() => {
    setStratigraphyIsVisible(location.pathname.startsWith(`/${id}/stratigraphy`));
    setHydrogeologyIsVisible(location.pathname.startsWith(`/${id}/hydrogeology`));
  }, [location, id]);

  if (borehole.isFetching === true) {
    return null;
  }

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
        <List divided relaxed selection>
          <ParentListItem
            style={{ borderTop: "none" }}
            active={location.pathname === "/" + id}
            onClick={() => {
              history.push("/" + id);
            }}>
            <List.Content>
              <List.Header as="h3" data-cy="location-menu-item">
                <Typography>{capitalizeFirstLetter(t("location"))}</Typography>
              </List.Header>
            </List.Content>
          </ParentListItem>
          <ParentListItem
            active={location.pathname === `/${id}/borehole`}
            onClick={() => {
              history.push(`/${id}/borehole`);
            }}>
            <List.Content>
              <List.Header as="h3" data-cy="borehole-menu-item">
                <Typography>{capitalizeFirstLetter(t("borehole"))}</Typography>
              </List.Header>
            </List.Content>
          </ParentListItem>
          <ParentListItem
            onClick={() => {
              setStratigraphyIsVisible(!stratigraphyIsVisible);
            }}>
            <List.Content>
              <List.Header as="h3" data-cy="stratigraphy-menu-item">
                <Typography>{capitalizeFirstLetter(t("stratigraphy"))}</Typography>
              </List.Header>
            </List.Content>
          </ParentListItem>
          {stratigraphyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/lithology`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/lithology`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="lithology-menu-item">
                    <Typography>{capitalizeFirstLetter(t("lithology"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/chronostratigraphy`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/chronostratigraphy`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="chronostratigraphy-menu-item">
                    <Typography>{capitalizeFirstLetter(t("chronostratigraphy"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/lithostratigraphy`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/lithostratigraphy`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="lithostratigraphy-menu-item">
                    <Typography>{capitalizeFirstLetter(t("lithostratigraphy"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
            </>
          )}
          <ParentListItem
            active={location.pathname.includes(`/${id}/completion`)}
            onClick={() => {
              history.push(`/${id}/completion`);
            }}>
            <List.Content>
              <List.Header as="h3" data-cy="completion-menu-item">
                <Typography>{capitalizeFirstLetter(t("completion"))}</Typography>
              </List.Header>
            </List.Content>
          </ParentListItem>
          <ParentListItem
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            <List.Content>
              <List.Header as="h3" data-cy="hydrogeology-menu-item">
                <Typography>{capitalizeFirstLetter(t("hydrogeology"))}</Typography>
              </List.Header>
            </List.Content>
          </ParentListItem>
          {hydrogeologyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/wateringress`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/wateringress`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="wateringress-menu-item">
                    <Typography>{capitalizeFirstLetter(t("waterIngress"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/groundwaterlevelmeasurement`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="groundwaterlevelmeasurement-menu-item">
                    <Typography>{capitalizeFirstLetter(t("groundwaterLevelMeasurement"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/fieldmeasurement`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="fieldmeasurement-menu-item">
                    <Typography>{capitalizeFirstLetter(t("fieldMeasurement"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/hydrotest`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/hydrotest`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="hydrotest-menu-item">
                    <Typography>{capitalizeFirstLetter(t("hydrotest"))}</Typography>
                  </List.Header>
                </List.Content>
              </ChildListItem>
            </>
          )}
          {!isAnonymousModeEnabled && (
            <>
              <ParentListItem
                active={location.pathname === `/${id}/attachments`}
                onClick={() => {
                  history.push(`/${id}/attachments`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="attachments-menu-item">
                    <Typography>{capitalizeFirstLetter(t("attachments"))}</Typography>
                  </List.Header>
                </List.Content>
              </ParentListItem>
              <ParentListItem
                active={location.pathname === `/${id}/status`}
                style={{ borderBottom: `1px solid ${theme.palette.boxShadow}` }}
                onClick={() => {
                  history.push(`/${id}/status`);
                }}>
                <List.Content>
                  <List.Header as="h3" data-cy="status-menu-item">
                    <Typography>{capitalizeFirstLetter(t("flowPublicationStatus"))}</Typography>
                  </List.Header>
                </List.Content>
              </ParentListItem>
            </>
          )}
        </List>
      </Box>
    </Box>
  );
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
  };
};

const ConnectedDetailSideNav = withRouter(connect(mapStateToProps)(DetailSideNav));

export default ConnectedDetailSideNav;
