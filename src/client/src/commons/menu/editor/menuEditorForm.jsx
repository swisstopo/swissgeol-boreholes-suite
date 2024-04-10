import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter, useLocation } from "react-router-dom";
import { Button, Header, Icon, List, Menu, Modal, Progress } from "semantic-ui-react";
import DateText from "../../form/dateText";
import TranslationText from "../../form/translationText";
import moment from "moment";
import { deleteBorehole, loadBorehole, lockBorehole, unlockBorehole } from "../../../api-lib/index";
import Scroller from "../../scroller";

const MenuEditorForm = ({ borehole, history, match, reload, t, user, unlock, lock }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timeout, setTimeoutState] = useState(60);
  const [detailsIsVisible, setDetailsIsVisible] = useState(false);
  const [stratigraphyIsVisible, setStratigraphyIsVisible] = useState(false);
  const [hydrogeologyIsVisible, setHydrogeologyIsVisible] = useState(false);
  const location = useLocation();

  const id = match.params.id;

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

  return [
    <Scroller
      key="sb-em-2"
      style={{
        flex: "1 1 100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}>
      <List divided relaxed selection>
        <List.Item
          onClick={() => {
            history.push("/");
          }}
          style={{
            padding: "1em",
          }}>
          <List.Icon name="arrow left" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header as="h3" data-cy="done-menu-item">
              <TranslationText id="done" />
            </List.Header>
          </List.Content>
        </List.Item>
        <List.Item
          active={location.pathname === "/" + id}
          onClick={() => {
            history.push("/" + id);
          }}
          style={{
            padding: "1em",
            borderLeft: location.pathname === "/" + id ? "0.25em solid rgb(237, 29, 36)" : null,
          }}>
          <List.Icon name="map marker" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header as="h3" data-cy="location-menu-item">
              <TranslationText firstUpperCase id="location" />
            </List.Header>
          </List.Content>
        </List.Item>
        <List.Item
          active={location.pathname === `/${id}/borehole`}
          onClick={() => {
            history.push(`/${id}/borehole`);
          }}
          style={{
            padding: "1em",
            borderLeft: location.pathname === `/${id}/borehole` ? "0.25em solid rgb(237, 29, 36)" : null,
          }}>
          <List.Icon name="info" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header as="h3" data-cy="borehole-menu-item">
              <TranslationText firstUpperCase id="borehole" />
            </List.Header>
          </List.Content>
        </List.Item>

        <List.Item
          onClick={() => {
            setStratigraphyIsVisible(!stratigraphyIsVisible);
          }}
          active={location.pathname.startsWith(`/${id}/stratigraphy`)}
          style={{
            padding: "1em",
            display: "flex",
          }}>
          <List.Icon name="align justify" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header as="h3" data-cy="stratigraphy-menu-item">
              <TranslationText firstUpperCase id="stratigraphy" />
            </List.Header>
          </List.Content>
          <div style={{ marginLeft: "2em" }}>
            {!stratigraphyIsVisible && <List.Icon name="angle down" size="big" verticalAlign="middle" />}
            {stratigraphyIsVisible && <List.Icon name="angle up" size="big" verticalAlign="middle" />}
          </div>
        </List.Item>
        {stratigraphyIsVisible && (
          <>
            <List.Item
              active={location.pathname === `/${id}/stratigraphy/lithology`}
              onClick={() => {
                history.push(`/${id}/stratigraphy/lithology`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/stratigraphy/lithology` ? "0.25em solid rgb(237, 29, 36)" : null,
              }}>
              <List.Icon name="align justify" size="large" verticalAlign="middle" />
              <List.Content>
                <List.Header as="h3" data-cy="lithology-menu-item">
                  <TranslationText firstUpperCase id="lithology" />
                </List.Header>
              </List.Content>
            </List.Item>
            <List.Item
              active={location.pathname === `/${id}/stratigraphy/chronostratigraphy`}
              onClick={() => {
                history.push(`/${id}/stratigraphy/chronostratigraphy`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/stratigraphy/chronostratigraphy`
                    ? "0.25em solid rgb(237, 29, 36)"
                    : null,
              }}>
              <List.Icon name="align justify" size="large" verticalAlign="middle" />
              <List.Content>
                <List.Header as="h3" data-cy="chronostratigraphy-menu-item">
                  <TranslationText firstUpperCase id="chronostratigraphy" />
                </List.Header>
              </List.Content>
            </List.Item>
            <List.Item
              active={location.pathname === `/${id}/stratigraphy/lithostratigraphy`}
              onClick={() => {
                history.push(`/${id}/stratigraphy/lithostratigraphy`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/stratigraphy/lithostratigraphy`
                    ? "0.25em solid rgb(237, 29, 36)"
                    : null,
              }}>
              <List.Icon name="align justify" size="large" verticalAlign="middle" />
              <List.Content>
                <List.Header as="h3" data-cy="lithostratigraphy-menu-item">
                  <TranslationText firstUpperCase id="lithostratigraphy" />
                </List.Header>
              </List.Content>
            </List.Item>
          </>
        )}
        <List.Item
          onClick={() => {
            setHydrogeologyIsVisible(!hydrogeologyIsVisible);
          }}
          active={location.pathname.startsWith(`/${id}/hydrogeology`)}
          style={{
            padding: "1em",
            display: "flex",
          }}>
          <img
            alt="Hydrogeology"
            src={"/img/Hydrogeology.png"}
            style={{
              opacity: location.pathname.startsWith(`/${id}/hydrogeology`) ? 1 : 0.5,
              height: "1.5em",
              paddingRight: "1em",
            }}
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
        </List.Item>
        {hydrogeologyIsVisible && (
          <>
            <List.Item
              active={location.pathname === `/${id}/hydrogeology/wateringress`}
              onClick={() => {
                history.push(`/${id}/hydrogeology/wateringress`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/hydrogeology/wateringress` ? "0.25em solid rgb(237, 29, 36)" : null,
              }}>
              <img
                alt="Water ingress"
                src={"/img/Hydrogeology.png"}
                style={{
                  height: "1.5em",
                  paddingRight: "1em",
                  opacity: location.pathname === `/${id}/hydrogeology/wateringress` ? 1 : 0.5,
                }}
              />
              <List.Content>
                <List.Header as="h3" data-cy="wateringress-menu-item">
                  <TranslationText firstUpperCase id="waterIngress" />
                </List.Header>
              </List.Content>
            </List.Item>
            <List.Item
              active={location.pathname === `/${id}/hydrogeology/hydrotest`}
              onClick={() => {
                history.push(`/${id}/hydrogeology/hydrotest`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/hydrogeology/hydrotest` ? "0.25em solid rgb(237, 29, 36)" : null,
              }}>
              <img
                alt="Hydrotest"
                src={"/img/Hydrogeology.png"}
                style={{
                  height: "21px",
                  paddingRight: "1em",
                  opacity: location.pathname === `/${id}/hydrogeology/hydrotest` ? 1 : 0.5,
                }}
              />
              <List.Content>
                <List.Header as="h3" data-cy="hydrotest-menu-item">
                  <TranslationText firstUpperCase id="hydrotest" />
                </List.Header>
              </List.Content>
            </List.Item>
          </>
        )}
        {hydrogeologyIsVisible && (
          <>
            <List.Item
              active={location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`}
              onClick={() => {
                history.push(`/${id}/hydrogeology/groundwaterlevelmeasurement`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement`
                    ? "0.25em solid rgb(237, 29, 36)"
                    : null,
              }}>
              <img
                alt="Groundwater Level Measurement"
                src={"/img/Hydrogeology.png"}
                style={{
                  height: "1.5em",
                  paddingRight: "1em",
                  opacity: location.pathname === `/${id}/hydrogeology/groundwaterlevelmeasurement` ? 1 : 0.5,
                }}
              />
              <List.Content>
                <List.Header as="h3" data-cy="groundwaterlevelmeasurement-menu-item">
                  <TranslationText firstUpperCase id="groundwaterLevelMeasurementWordBreak" />
                </List.Header>
              </List.Content>
            </List.Item>
            <List.Item
              active={location.pathname === `/${id}/hydrogeology/fieldmeasurement`}
              onClick={() => {
                history.push(`/${id}/hydrogeology/fieldmeasurement`);
              }}
              style={{
                padding: "1em",
                paddingLeft: 40,
                display: "flex",
                borderLeft:
                  location.pathname === `/${id}/hydrogeology/fieldmeasurement` ? "0.25em solid rgb(237, 29, 36)" : null,
              }}>
              <img
                alt="Field Measurement"
                src={"/img/Hydrogeology.png"}
                style={{
                  height: "1.5em",
                  paddingRight: "1em",
                  opacity: location.pathname === `/${id}/hydrogeology/fieldmeasurement` ? 1 : 0.5,
                }}
              />
              <List.Content>
                <List.Header as="h3" data-cy="fieldmeasurement-menu-item">
                  <TranslationText firstUpperCase id="fieldMeasurement" />
                </List.Header>
              </List.Content>
            </List.Item>
          </>
        )}
        <List.Item
          active={location.pathname.includes(`/${id}/completion`)}
          onClick={() => {
            history.push(`/${id}/completion`);
          }}
          style={{
            padding: "1em",
            display: "flex",
            borderLeft: location.pathname.includes(`/${id}/completion`) ? "0.25em solid rgb(237, 29, 36)" : null,
          }}>
          <img
            alt="completion"
            src={"/img/Completion.png"}
            style={{
              height: "1.5em",
              paddingRight: "1em",
              opacity: location.pathname.includes(`/${id}/completion`) ? 1 : 0.5,
            }}
          />
          <List.Content>
            <List.Header as="h3" data-cy="completion-menu-item">
              <TranslationText firstUpperCase id="completion" />
            </List.Header>
          </List.Content>
        </List.Item>
        <List.Item
          active={location.pathname === `/${id}/attachments`}
          onClick={() => {
            history.push(`/${id}/attachments`);
          }}
          style={{
            padding: "1em",
            borderLeft: location.pathname === `/${id}/attachments` ? "0.25em solid rgb(237, 29, 36)" : null,
          }}>
          <List.Icon name="attach" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header as="h3" data-cy="attachments-menu-item">
              <TranslationText firstUpperCase id="attachments" />
            </List.Header>
          </List.Content>
        </List.Item>
      </List>
    </Scroller>,
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
            color: "#787878",
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
              color: "#787878",
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
                color: "#787878",
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
              color: "#787878",
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
                color: "#787878",
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
                color: "#787878",
              }}>
              {borehole.data.lock !== null ? <TranslationText id="locked_at" /> : <TranslationText id="updateDate" />}:
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
    </div>,
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
    </Menu>,
  ];
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

const ConnectedMenuEditorForm = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(MenuEditorForm)),
);

export default ConnectedMenuEditorForm;
