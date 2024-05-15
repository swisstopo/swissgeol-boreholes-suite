import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter, useLocation } from "react-router-dom";
import { Button, Header, Icon, List, Menu, Modal, Progress } from "semantic-ui-react";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import DateText from "../../form/dateText";
import TranslationText from "../../form/translationText";
import moment from "moment";
import { deleteBorehole, loadBorehole, lockBorehole, unlockBorehole } from "../../../api-lib/index";
import { theme } from "../../../AppTheme";

/**
 * A component that renders the side navigation for a borehole detail. The component is used without explicitly passing props.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.borehole - The borehole object containing data and fetching status, provided by react redux state.
 * @param {Object} props.user - The user object containing information about the current user, provided by react redux state.
 * @param {Object} props.match - The match object containing the URL parameters.
 * @param {Function} props.reload - Function to trigger reloading of the borehole data, a react redux action that is being dispatched..
 * @param {Function} props.unlock - Function to unlock the borehole, a react redux action that is being dispatched.
 * @param {Function} props.lock - Function to lock the borehole, a react redux action that is being dispatched.
 * @param {Function} props.t - Function for translation provided by `withTranslation`.
 * @param {Object} props.history - The history object from `withRouter` to navigate between routes.
 * @returns {JSX.Element | null} The rendered `DetailSideNav` component.
 */

const DetailSideNav = ({ borehole, history, match, reload, t, user, unlock, lock }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timeout, setTimeoutState] = useState(60);
  const [detailsIsVisible, setDetailsIsVisible] = useState(false);
  const [stratigraphyIsVisible, setStratigraphyIsVisible] = useState(false);
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const location = useLocation();

  const id = match?.params?.id;

  const ParentListItem = styled(ListItem)(({ active }) => ({
    padding: "1em",
    display: "flex",
    cursor: "pointer",
    borderTop: "1px solid lightgray",
    borderLeft: active ? `0.25em solid ${theme.palette.error.main}` : null,
    "&:hover": {
      backgroundColor: theme.palette.hover.main,
    },
  }));

  const ChildListItem = styled(ParentListItem)(() => ({
    paddingLeft: "2.5em !important",
  }));

  const StyledIcon = styled("img")(({ active }) => ({
    height: "1.5em",
    paddingRight: "1em",
    opacity: active ? 1 : 0.5,
  }));

  useEffect(() => {
    setStratigraphyIsVisible(location.pathname.startsWith(`/${id}/stratigraphy`));
    setHydrogeologyIsVisible(location.pathname.startsWith(`/${id}/hydrogeology`));
  }, [location, id]);

  const handleClose = () => {
    setConfirmDelete(false);
  };

  if (borehole.isFetching === true) {
    return null;
  }

  let editableByCurrentUser = true;
  const wg =
    borehole.data.id !== null && user.data.workgroups.find(workgroup => workgroup.id === borehole.data.workgroup.id);
  if (wg !== undefined && Object.prototype.hasOwnProperty.call(wg, "roles")) {
    editableByCurrentUser = wg.roles.indexOf(borehole.data.role) === -1;
  }

  const boreholeLockTime = 3600;

  return (
    <Box
      style={{
        boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
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
            onClick={() => {
              history.push("/");
            }}>
            <List.Icon name="arrow left" size="large" verticalAlign="middle" style={{ opacity: 0.5 }} />
            <List.Content>
              <List.Header as="h3" data-cy="done-menu-item">
                <TranslationText id="done" />
              </List.Header>
            </List.Content>
          </ParentListItem>
          <ParentListItem
            active={location.pathname === "/" + id}
            onClick={() => {
              history.push("/" + id);
            }}>
            <List.Icon
              name="map marker"
              size="large"
              verticalAlign="middle"
              style={{ opacity: location.pathname === `/${id}` ? 1 : 0.5 }}
            />
            <List.Content>
              <List.Header as="h3" data-cy="location-menu-item">
                <TranslationText firstUpperCase id="location" />
              </List.Header>
            </List.Content>
          </ParentListItem>
          <ParentListItem
            active={location.pathname === `/${id}/borehole`}
            onClick={() => {
              history.push(`/${id}/borehole`);
            }}>
            <List.Icon
              name="info"
              size="large"
              verticalAlign="middle"
              style={{ opacity: location.pathname === `/${id}/borehole` ? 1 : 0.5 }}
            />
            <List.Content>
              <List.Header as="h3" data-cy="borehole-menu-item">
                <TranslationText firstUpperCase id="borehole" />
              </List.Header>
            </List.Content>
          </ParentListItem>

          <ParentListItem
            onClick={() => {
              setStratigraphyIsVisible(!stratigraphyIsVisible);
            }}>
            <List.Icon
              name="align justify"
              size="large"
              verticalAlign="middle"
              style={{ opacity: location.pathname.startsWith(`/${id}/stratigraphy`) ? 1 : 0.5 }}
            />
            <List.Content>
              <List.Header as="h3" data-cy="stratigraphy-menu-item">
                <TranslationText firstUpperCase id="stratigraphy" />
              </List.Header>
            </List.Content>
            <div style={{ marginLeft: "2em" }}>
              {!stratigraphyIsVisible && <List.Icon name="angle down" size="big" verticalAlign="middle" />}
              {stratigraphyIsVisible && <List.Icon name="angle up" size="big" verticalAlign="middle" />}
            </div>
          </ParentListItem>
          {stratigraphyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/lithology`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/lithology`);
                }}>
                <List.Icon
                  name="align justify"
                  size="large"
                  verticalAlign="middle"
                  style={{ opacity: location.pathname === `/${id}/stratigraphy/lithology` ? 1 : 0.5 }}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="lithology-menu-item">
                    <TranslationText firstUpperCase id="lithology" />
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/chronostratigraphy`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/chronostratigraphy`);
                }}>
                <List.Icon
                  name="align justify"
                  size="large"
                  verticalAlign="middle"
                  style={{ opacity: location.pathname === `/${id}/stratigraphy/chronostratigraphy` ? 1 : 0.5 }}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="chronostratigraphy-menu-item">
                    <TranslationText firstUpperCase id="chronostratigraphy" />
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/stratigraphy/lithostratigraphy`}
                onClick={() => {
                  history.push(`/${id}/stratigraphy/lithostratigraphy`);
                }}>
                <List.Icon
                  name="align justify"
                  size="large"
                  verticalAlign="middle"
                  style={{ opacity: location.pathname === `/${id}/stratigraphy/lithostratigraphy` ? 1 : 0.5 }}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="lithostratigraphy-menu-item">
                    <TranslationText firstUpperCase id="lithostratigraphy" />
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
            <StyledIcon
              alt="Completion"
              src={"/img/Completion.png"}
              active={location.pathname.includes(`/${id}/completion`)}
            />
            <List.Content>
              <List.Header as="h3" data-cy="completion-menu-item">
                <TranslationText firstUpperCase id="completion" />
              </List.Header>
            </List.Content>
          </ParentListItem>
          <ParentListItem
            onClick={() => {
              setHydrogeologyIsVisible(!hydrogeologyIsVisible);
            }}>
            <StyledIcon
              alt="Hydrogeology"
              src={"/img/Hydrogeology.png"}
              active={location.pathname.startsWith(`/${id}/hydrogeology`)}
            />
            <List.Content>
              <List.Header as="h3" data-cy="hydrogeology-menu-item">
                <TranslationText firstUpperCase id="hydrogeology" />
              </List.Header>
            </List.Content>
            <div style={{ marginLeft: "2em" }}>
              {!hydrogeologyIsVisible && <List.Icon name="angle down" size="big" verticalAlign="middle" />}
              {hydrogeologyIsVisible && <List.Icon name="angle up" size="big" verticalAlign="middle" />}
            </div>
          </ParentListItem>
          {hydrogeologyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/wateringress`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/wateringress`);
                }}>
                <StyledIcon
                  alt="Water ingress"
                  src={"/img/Hydrogeology.png"}
                  active={location.pathname === `/${id}/hydrogeology/wateringress`}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="wateringress-menu-item">
                    <TranslationText firstUpperCase id="waterIngress" />
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/hydrotest`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/hydrotest`);
                }}>
                <StyledIcon
                  alt="Hydrotest"
                  src={"/img/Hydrogeology.png"}
                  active={location.pathname === `/${id}/hydrogeology/hydrotest`}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="hydrotest-menu-item">
                    <TranslationText firstUpperCase id="hydrotest" />
                  </List.Header>
                </List.Content>
              </ChildListItem>
            </>
          )}
          {hydrogeologyIsVisible && (
            <>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/groundwaterlevelmeasurement`);
                }}>
                <StyledIcon
                  alt="Groundwater Level Measurement"
                  src={"/img/Hydrogeology.png"}
                  active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="groundwaterlevelmeasurement-menu-item">
                    <TranslationText firstUpperCase id="groundwaterLevelMeasurementWordBreak" />
                  </List.Header>
                </List.Content>
              </ChildListItem>
              <ChildListItem
                active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                onClick={() => {
                  history.push(`/${id}/hydrogeology/fieldmeasurement`);
                }}>
                <StyledIcon
                  alt="Field Measurement"
                  src={"/img/Hydrogeology.png"}
                  active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="fieldmeasurement-menu-item">
                    <TranslationText firstUpperCase id="fieldMeasurement" />
                  </List.Header>
                </List.Content>
              </ChildListItem>
            </>
          )}
          <ParentListItem
            active={location.pathname === `/${id}/attachments`}
            style={{ borderBottom: "1px solid lightgray" }}
            onClick={() => {
              history.push(`/${id}/attachments`);
            }}>
            <List.Icon
              name="attach"
              size="large"
              verticalAlign="middle"
              style={{ opacity: location.pathname === `/${id}/attachments` ? 1 : 0.5 }}
            />
            <List.Content>
              <List.Header as="h3" data-cy="attachments-menu-item">
                <TranslationText firstUpperCase id="attachments" />
              </List.Header>
            </List.Content>
          </ParentListItem>
        </List>
      </Box>
      <div
        key="medf-prps"
        style={{
          padding: "1em",
          paddingTop: 0,
          border: "1px solid lightgray",
          borderBottomWidth: 0,
          borderRadius: 5,
        }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => setDetailsIsVisible(!detailsIsVisible)}>
          {detailsIsVisible ? <Icon name="angle down" /> : <Icon name="angle up" />}
          more Info
        </div>
        <div>
          <div
            style={{
              fontSize: "0.7em",
              color: theme.palette.text.secondary,
            }}>
            <TranslationText id="locked_status" />
          </div>
          <div
            style={{
              fontWeight: "bold",
            }}>
            <span
              style={{
                color: "red",
              }}>
              {borehole.data.lock !== null || borehole.data.role === null ? (
                <TranslationText id="editingEnabled" />
              ) : (
                <TranslationText id={`status${borehole.data.role.toLowerCase()}`} />
              )}
            </span>
          </div>
        </div>

        {borehole.data.imported === true ? (
          <div
            style={{
              fontSize: "0.7em",
              color: "rgb(33, 133, 208)",
            }}>
            <TranslationText id="importedData" />
          </div>
        ) : null}

        {detailsIsVisible && (
          <div>
            <div
              style={{
                fontSize: "0.7em",
                color: theme.palette.text.secondary,
              }}>
              {borehole.data.workgroup && borehole.data.workgroup.supplier === true ? (
                <TranslationText id="supplier" />
              ) : (
                <TranslationText id="workgroup" />
              )}
            </div>
            <div
              style={{
                fontWeight: "bold",
              }}>
              {borehole.data.workgroup && borehole.data.workgroup.name}
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.7em",
                  color: theme.palette.text.secondary,
                }}>
                {borehole.data.imported === true ? (
                  <TranslationText id="importedBy" />
                ) : (
                  <TranslationText id="createdBy" />
                )}
                :
              </div>
              <div
                style={{
                  fontWeight: "bold",
                }}>
                {borehole.data.creator !== undefined
                  ? borehole.data.creator.id === user.data.id
                    ? borehole.data.creator.fullname + " (" + t("common:you") + ")"
                    : borehole.data.creator.fullname
                  : "-"}
              </div>
            </div>
            <div
              style={{
                fontSize: "0.7em",
                color: theme.palette.text.secondary,
              }}>
              {borehole.data.imported === true ? (
                <TranslationText id="importDate" />
              ) : (
                <TranslationText id="createDate" />
              )}
              :
            </div>
            <div
              style={{
                fontWeight: "bold",
              }}>
              {borehole.data.creator && <DateText date={borehole.data.creator.date} hours />}
            </div>
            <div
              style={{
                fontSize: "0.8em",
                marginBottom: "0.25em",
              }}>
              {borehole.data.creator !== undefined ? <DateText date={borehole.data.creator.date} fromnow /> : "-"}
            </div>
          </div>
        )}

        <div>
          {detailsIsVisible && (
            <div>
              <div
                style={{
                  fontSize: "0.7em",
                  color: theme.palette.text.secondary,
                }}>
                {borehole.data.lock !== null ? <TranslationText id="locked_by" /> : <TranslationText id="updatedBy" />}:
              </div>
              <div
                style={{
                  fontWeight: "bold",
                }}>
                {borehole.data.lock !== null
                  ? borehole.data.lock.id === user.data.id
                    ? borehole.data.updater.fullname + " (" + t("common:you") + ")"
                    : borehole.data.lock.fullname
                  : borehole.data.updater.id === user.data.id
                    ? borehole.data.updater.fullname + " (" + t("common:you") + ")"
                    : borehole.data.updater.fullname}
              </div>
              <div
                style={{
                  fontSize: "0.7em",
                  color: theme.palette.text.secondary,
                }}>
                {borehole.data.lock !== null ? <TranslationText id="locked_at" /> : <TranslationText id="updateDate" />}
                :
              </div>
              <div
                style={{
                  fontWeight: "bold",
                }}>
                {borehole.data.lock !== null ? (
                  <DateText date={borehole.data.lock.date} hours />
                ) : (
                  <DateText date={borehole.data.updater.date} hours />
                )}
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: "0.8em",
              marginBottom: "0.25em",
            }}>
            {borehole.data.lock !== null ? (
              <span
                style={{
                  color: timeout >= 90 ? "red" : null,
                }}>
                <DateText
                  date={borehole.data.lock.date}
                  fromnow
                  onTick={(d, m) => {
                    const to = (moment().diff(m, "seconds") / boreholeLockTime) * 100;
                    setTimeoutState(to);
                    if (to > 100) {
                      unlock(borehole.data.id);
                    }
                  }}
                  timer={1}
                />
              </span>
            ) : (
              <DateText date={borehole.data.updater.date} fromnow />
            )}
          </div>
          {borehole.data.lock !== null && editableByCurrentUser === false ? (
            <Progress
              color={timeout >= 90 ? "red" : timeout >= 80 ? "orange" : "black"}
              percent={timeout}
              size="tiny"
              style={{
                margin: "0.5em 0em 0.2em",
              }}
            />
          ) : null}
          {borehole.data.lock !== null && editableByCurrentUser === false ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                fontSize: "0.8em",
              }}>
              <div style={{ flex: "1 1 100%" }}>
                {(() => {
                  let d = moment.duration(moment(borehole.data.lock.date).add(60, "minutes").diff(moment()));
                  return d.minutes().toString().padStart(2, "0") + ":" + d.seconds().toString().padStart(2, "0");
                })()}
              </div>
              <div>
                <span
                  className="linker"
                  onClick={() => {
                    lock(borehole.data.id);
                  }}>
                  <TranslationText id="refresh" />
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Menu
        icon="labeled"
        key="sb-em-3"
        size="mini"
        style={{
          margin: "0px",
          minHeight: "70px",
        }}>
        {editableByCurrentUser === true ? null : (
          <Modal
            closeIcon
            onClose={handleClose}
            open={confirmDelete}
            size="mini"
            trigger={
              <Menu.Item
                disabled={borehole.data.lock === null || borehole.data.lock.id !== user.data.id}
                onClick={() => {
                  setConfirmDelete(true);
                }}
                style={{
                  flex: 1,
                }}>
                <Icon name="trash alternate" />
                <TranslationText id="delete" />
              </Menu.Item>
            }>
            <Header content={<TranslationText id="deleteForever" />} />
            <Modal.Content>
              <p>
                <TranslationText id="sure" />
              </p>
            </Modal.Content>
            <Modal.Actions>
              <Button
                negative
                loading={deleting}
                onClick={() => {
                  setDeleting(true);
                  deleteBorehole(borehole.data.id).then(function () {
                    history.push("/");
                  });
                }}>
                <Icon name="trash alternate" />
                &nbsp;
                <TranslationText id="delete" />
              </Button>
            </Modal.Actions>
          </Modal>
        )}
        {editableByCurrentUser === true ? null : (
          <Menu.Item
            disabled={borehole.data.lock !== null && borehole.data.lock.id !== user.data.id}
            onClick={() => {
              if (borehole.data.lock !== null && borehole.data.lock.id === user.data.id) {
                unlock(borehole.data.id);
              } else if (borehole.data.lock === null) {
                lock(borehole.data.id);
              }
            }}
            style={{
              flex: 1,
            }}>
            <Icon
              name={
                borehole.data.lock !== null &&
                moment().diff(moment(borehole.data.lock.date), "seconds") < boreholeLockTime
                  ? "stop"
                  : "play"
              }
            />
            {borehole.data.lock !== null &&
            moment().diff(moment(borehole.data.lock.date), "seconds") < boreholeLockTime ? (
              <TranslationText id="editingStop" />
            ) : (
              <TranslationText id="editingStart" />
            )}
          </Menu.Item>
        )}
        {editableByCurrentUser === true ? (
          <Menu.Item
            disabled={borehole.isFetching === true}
            onClick={() => {
              reload(borehole.data.id);
            }}
            style={{
              flex: 1,
            }}>
            <Icon loading={borehole.isFetching === true} name="refresh" />
            {t("common:refresh")}
          </Menu.Item>
        ) : null}
      </Menu>
    </Box>
  );
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
    editor: state.editor,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSelected: borehole => {
      dispatch({
        path: "/borehole",
        type: "CLEAR",
      });
      dispatch({
        type: "EDITOR_BOREHOLE_SELECTED",
        selected: borehole,
      });
    },
    lock: id => {
      dispatch(lockBorehole(id));
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
    unlock: id => {
      return dispatch(unlockBorehole(id));
    },
    reload: id => {
      dispatch(loadBorehole(id));
    },
  };
};

const ConnectedDetailSideNav = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(DetailSideNav)),
);

export default ConnectedDetailSideNav;