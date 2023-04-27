import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";

import {
  Button,
  Header,
  Icon,
  List,
  Menu,
  Modal,
  Progress,
} from "semantic-ui-react";

import DateText from "../../form/dateText";
import TranslationText from "../../form/translationText";
import moment from "moment";

import {
  deleteBorehole,
  loadBorehole,
  lockBorehole,
  unlockBorehole,
} from "../../../api-lib/index";

import Scroller from "../../scroller";

const timeout = 10;

class MenuEditorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDelete: false,
      delete: false,
      deleting: false,
      timeout: 0,
      completionIsVisible: false,
      detailsIsVisible: false,
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleOpen() {
    this.setState({ confirmDelete: true });
  }

  handleClose() {
    this.setState({ confirmDelete: false });
  }

  render() {
    const { borehole, history, location, match, reload, t, user } = this.props;
    if (borehole.isFetching === true) {
      return null;
    }

    let editableByCurrentUser = true;
    const wg =
      borehole.data.id !== null &&
      user.data.workgroups.find(
        workgroup => workgroup.id === borehole.data.workgroup.id,
      );
    if (wg !== undefined && wg.hasOwnProperty("roles")) {
      editableByCurrentUser = wg.roles.indexOf(borehole.data.role) === -1;
    }

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
              this.setState(
                {
                  delete: false,
                },
                () => {
                  history.push(process.env.PUBLIC_URL + "/editor");
                },
              );
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
            active={
              location.pathname ===
              process.env.PUBLIC_URL + "/editor/" + match.params.id
            }
            onClick={() => {
              history.push(
                process.env.PUBLIC_URL + "/editor/" + match.params.id,
              );
            }}
            style={{
              padding: "1em",
              borderLeft:
                location.pathname ===
                process.env.PUBLIC_URL + "/editor/" + match.params.id
                  ? "0.25em solid rgb(237, 29, 36)"
                  : null,
            }}>
            <List.Icon name="map marker" size="large" verticalAlign="middle" />
            <List.Content>
              <List.Header as="h3" data-cy="location-menu-item">
                <TranslationText firstUpperCase id="location" />
              </List.Header>
            </List.Content>
          </List.Item>
          <List.Item
            active={
              location.pathname ===
              `${process.env.PUBLIC_URL}/editor/${match.params.id}/borehole`
            }
            onClick={() => {
              history.push(
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/borehole`,
              );
            }}
            style={{
              padding: "1em",
              borderLeft:
                location.pathname ===
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/borehole`
                  ? "0.25em solid rgb(237, 29, 36)"
                  : null,
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
              this.setState({
                stratigraphyIsVisible: !this.state.stratigraphyIsVisible,
              });
            }}
            style={{
              padding: "1em",
              display: "flex",
              borderLeft: [
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy`,
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy/chronostratigraphy`,
              ].includes(location.pathname)
                ? "0.25em solid rgb(237, 29, 36)"
                : null,
            }}>
            <List.Icon
              name="align justify"
              size="large"
              verticalAlign="middle"
            />
            <List.Content>
              <List.Header as="h3" data-cy="stratigraphy-menu-item">
                <TranslationText firstUpperCase id="stratigraphy" />
              </List.Header>
            </List.Content>
            <div style={{ marginLeft: "2em" }}>
              {!this.state.stratigraphyIsVisible && (
                <List.Icon
                  name="angle down"
                  size="big"
                  verticalAlign="middle"
                />
              )}
              {this.state.stratigraphyIsVisible && (
                <List.Icon name="angle up" size="big" verticalAlign="middle" />
              )}
            </div>
          </List.Item>
          {this.state.stratigraphyIsVisible && (
            <>
              <List.Item
                active={
                  location.pathname ===
                  `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy`
                }
                onClick={() => {
                  history.push(
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy`,
                  );
                }}
                style={{
                  padding: "1em",
                  paddingLeft: 40,
                  display: "flex",
                  borderLeft:
                    location.pathname ===
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy`
                      ? "0.25em solid rgb(237, 29, 36)"
                      : null,
                }}>
                <List.Icon
                  name="align justify"
                  size="large"
                  verticalAlign="middle"
                />
                <List.Content>
                  <List.Header as="h3" data-cy="lithology-menu-item">
                    <TranslationText firstUpperCase id="lithology" />
                  </List.Header>
                </List.Content>
              </List.Item>
              <List.Item
                active={
                  location.pathname ===
                  `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy/chronostratigraphy`
                }
                onClick={() => {
                  history.push(
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy/chronostratigraphy`,
                  );
                }}
                style={{
                  padding: "1em",
                  paddingLeft: 40,
                  display: "flex",
                  borderLeft:
                    location.pathname ===
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/stratigraphy/chronostratigraphy`
                      ? "0.25em solid rgb(237, 29, 36)"
                      : null,
                }}>
                <List.Icon
                  name="align justify"
                  size="large"
                  verticalAlign="middle"
                />
                <List.Content>
                  <List.Header as="h3" data-cy="chronostratigraphy-menu-item">
                    <TranslationText firstUpperCase id="chronostratigraphy" />
                  </List.Header>
                </List.Content>
              </List.Item>
            </>
          )}
          <List.Item
            onClick={() => {
              this.setState({
                hydrogeologyIsVisible: !this.state.hydrogeologyIsVisible,
              });
            }}
            style={{
              padding: "1em",
              display: "flex",
              borderLeft: [
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/hydrogeology/watgeringress`,
              ].includes(location.pathname)
                ? "0.25em solid rgb(237, 29, 36)"
                : null,
            }}>
            <img
              alt="Hydrogeology"
              src={process.env.PUBLIC_URL + "/img/Hydrogeology.png"}
              style={{
                height: "21px",
                paddingRight: "1em",
                opacity: this.state.completionIsVisible ? 1 : 0.5,
              }}
            />
            <List.Content>
              <List.Header as="h3" data-cy="hydrogeology-menu-item">
                <TranslationText firstUpperCase id="hydrogeology" />
              </List.Header>
            </List.Content>
            <div style={{ marginLeft: "2em" }}>
              {!this.state.hydrogeologyIsVisible && (
                <List.Icon
                  name="angle down"
                  size="big"
                  verticalAlign="middle"
                />
              )}
              {this.state.hydrogeologyIsVisible && (
                <List.Icon name="angle up" size="big" verticalAlign="middle" />
              )}
            </div>
          </List.Item>
          {this.state.hydrogeologyIsVisible && (
            <>
              <List.Item
                active={
                  location.pathname ===
                  `${process.env.PUBLIC_URL}/editor/${match.params.id}/hydrogeology/wateringress`
                }
                onClick={() => {
                  history.push(
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/hydrogeology/wateringress`,
                  );
                }}
                style={{
                  padding: "1em",
                  paddingLeft: 40,
                  display: "flex",
                  borderLeft:
                    location.pathname ===
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/hydrogeology/wateringress`
                      ? "0.25em solid rgb(237, 29, 36)"
                      : null,
                }}>
                <List.Icon
                  name="align justify"
                  size="large"
                  verticalAlign="middle"
                />
                <List.Content>
                  <List.Header as="h3" data-cy="hydrogeology-menu-item">
                    <TranslationText firstUpperCase id="wateringress" />
                  </List.Header>
                </List.Content>
              </List.Item>
            </>
          )}
          <List.Item
            onClick={() => {
              this.setState({
                completionIsVisible: !this.state.completionIsVisible,
              });
            }}
            style={{
              padding: "0.9em",
              display: "flex",
              borderLeft: [
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/casing`,
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/filling`,
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/instruments`,
              ].includes(location.pathname)
                ? "0.25em solid rgb(237, 29, 36)"
                : null,
            }}>
            <img
              alt="Completion"
              src={process.env.PUBLIC_URL + "/img/Completion.png"}
              style={{
                height: "21px",
                paddingRight: "1em",
                opacity: this.state.completionIsVisible ? 1 : 0.5,
              }}
            />
            <List.Content>
              <List.Header as="h3" data-cy="completion-menu-item">
                <TranslationText firstUpperCase id="completion" />
              </List.Header>
            </List.Content>
            <div style={{ marginLeft: "2em" }}>
              {!this.state.completionIsVisible && (
                <List.Icon
                  name="angle down"
                  size="big"
                  verticalAlign="middle"
                />
              )}
              {this.state.completionIsVisible && (
                <List.Icon name="angle up" size="big" verticalAlign="middle" />
              )}
            </div>
          </List.Item>
          {this.state.completionIsVisible && (
            <>
              <List.Item
                active={
                  location.pathname ===
                  `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/casing`
                }
                onClick={() => {
                  history.push(
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/casing`,
                  );
                }}
                style={{
                  padding: "1em",
                  paddingLeft: 40,
                  display: "flex",
                  borderLeft:
                    location.pathname ===
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/casing`
                      ? "0.25em solid rgb(237, 29, 36)"
                      : null,
                }}>
                <img
                  alt="casing"
                  src={process.env.PUBLIC_URL + "/img/Casing.png"}
                  style={{
                    height: "19px",
                    paddingRight: "1em",
                    opacity:
                      location.pathname ===
                      `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/casing`
                        ? 1
                        : 0.5,
                  }}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="casing-menu-item">
                    <TranslationText firstUpperCase id="casing" />
                  </List.Header>
                </List.Content>
              </List.Item>
              <List.Item
                active={
                  location.pathname ===
                  `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/instruments`
                }
                onClick={() => {
                  history.push(
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/instruments`,
                  );
                }}
                style={{
                  padding: "1em",
                  paddingLeft: 40,
                  display: "flex",
                  borderLeft:
                    location.pathname ===
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/instruments`
                      ? "0.25em solid rgb(237, 29, 36)"
                      : null,
                }}>
                <img
                  alt="Instruments"
                  src={process.env.PUBLIC_URL + "/img/Instruments.png"}
                  style={{
                    height: "19px",
                    paddingRight: "1em",
                    opacity:
                      location.pathname ===
                      `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/instruments`
                        ? 1
                        : 0.5,
                  }}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="instrument-menu-item">
                    <TranslationText firstUpperCase id="instrument" />
                  </List.Header>
                </List.Content>
              </List.Item>
              <List.Item
                active={
                  location.pathname ===
                  `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/filling`
                }
                onClick={() => {
                  history.push(
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/filling`,
                  );
                }}
                style={{
                  padding: "1em",
                  paddingLeft: 40,
                  display: "flex",
                  borderLeft:
                    location.pathname ===
                    `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/filling`
                      ? "0.25em solid rgb(237, 29, 36)"
                      : null,
                }}>
                <img
                  alt="Filling"
                  src={process.env.PUBLIC_URL + "/img/Filling.png"}
                  style={{
                    height: "19px",
                    paddingRight: "1em",
                    opacity:
                      location.pathname ===
                      `${process.env.PUBLIC_URL}/editor/${match.params.id}/completion/filling`
                        ? 1
                        : 0.5,
                  }}
                />
                <List.Content>
                  <List.Header as="h3" data-cy="filling-menu-item">
                    <TranslationText firstUpperCase id="filling" />
                  </List.Header>
                </List.Content>
              </List.Item>
            </>
          )}
          <List.Item
            active={
              location.pathname ===
              `${process.env.PUBLIC_URL}/editor/${match.params.id}/attachments`
            }
            onClick={() => {
              history.push(
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/attachments`,
              );
            }}
            style={{
              padding: "1em",
              borderLeft:
                location.pathname ===
                `${process.env.PUBLIC_URL}/editor/${match.params.id}/attachments`
                  ? "0.25em solid rgb(237, 29, 36)"
                  : null,
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
          onClick={() =>
            this.setState({ detailsIsVisible: !this.state.detailsIsVisible })
          }>
          {this.state.detailsIsVisible ? (
            <Icon name="angle down" />
          ) : (
            <Icon name="angle up" />
          )}
          more Info
          {/* +<Icon name="info" /> */}
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
                <TranslationText
                  id={`status${borehole.data.role.toLowerCase()}`}
                />
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
        {/* start */}
        {this.state.detailsIsVisible && (
          <div>
            <div
              style={{
                fontSize: "0.7em",
                color: "#787878",
              }}>
              {borehole.data.workgroup &&
              borehole.data.workgroup.supplier === true ? (
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
                  ? borehole.data.creator.username ===
                    this.props.user.data.username
                    ? borehole.data.creator.fullname +
                      " (" +
                      t("common:you") +
                      ")"
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
              {borehole.data.creator && (
                <DateText date={borehole.data.creator.date} hours />
              )}
            </div>
            <div
              style={{
                fontSize: "0.8em",
                marginBottom: "0.25em",
              }}>
              {borehole.data.creator !== undefined ? (
                <DateText date={borehole.data.creator.date} fromnow />
              ) : (
                "-"
              )}
            </div>
          </div>
        )}

        <div>
          {this.state.detailsIsVisible && (
            <div>
              <div
                style={{
                  fontSize: "0.7em",
                  color: "#787878",
                }}>
                {borehole.data.lock !== null ? (
                  <TranslationText id="locked_by" />
                ) : (
                  <TranslationText id="updatedBy" />
                )}
                :
              </div>
              <div
                style={{
                  fontWeight: "bold",
                }}>
                {borehole.data.lock !== null
                  ? borehole.data.lock.username ===
                    this.props.user.data.username
                    ? borehole.data.updater.fullname +
                      " (" +
                      t("common:you") +
                      ")"
                    : borehole.data.lock.fullname
                  : borehole.data.updater.username ===
                    this.props.user.data.username
                  ? borehole.data.updater.fullname +
                    " (" +
                    t("common:you") +
                    ")"
                  : borehole.data.updater.fullname}
              </div>
              <div
                style={{
                  fontSize: "0.7em",
                  color: "#787878",
                }}>
                {borehole.data.lock !== null ? (
                  <TranslationText id="locked_at" />
                ) : (
                  <TranslationText id="updateDate" />
                )}
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
          {/* end */}
          <div
            style={{
              fontSize: "0.8em",
              marginBottom: "0.25em",
            }}>
            {borehole.data.lock !== null ? (
              <span
                style={{
                  color: this.state.timeout >= 90 ? "red" : null,
                }}>
                <DateText
                  date={borehole.data.lock.date}
                  fromnow
                  onTick={(d, m) => {
                    this.setState(
                      {
                        timeout:
                          (moment().diff(m, "seconds") / (timeout * 60)) * 100,
                      },
                      () => {
                        if (this.state.timeout > 100) {
                          this.props.unlock(borehole.data.id);
                        }
                      },
                    );
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
              color={
                this.state.timeout >= 90
                  ? "red"
                  : this.state.timeout >= 80
                  ? "orange"
                  : "black"
              }
              percent={this.state.timeout}
              size="tiny"
              style={{
                margin: "0.5em 0em 0.2em",
              }}
            />
          ) : null}
          {borehole.data.lock !== null && editableByCurrentUser === false ? (
            <div
              style={{
                // textAlign: 'right'
                display: "flex",
                flexDirection: "row",
                fontSize: "0.8em",
              }}>
              <div style={{ flex: "1 1 100%" }}>
                {(() => {
                  let d = moment.duration(
                    moment(borehole.data.lock.date)
                      .add(10, "minutes")
                      .diff(moment()),
                  );
                  return (
                    d.minutes().toString().padStart(2, "0") +
                    ":" +
                    d.seconds().toString().padStart(2, "0")
                  );
                })()}
              </div>
              <div>
                <span
                  className="linker"
                  onClick={() => {
                    this.props.lock(borehole.data.id);
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
            onClose={this.handleClose}
            open={this.state.confirmDelete}
            size="mini"
            trigger={
              <Menu.Item
                disabled={
                  borehole.data.lock === null ||
                  borehole.data.lock.username !== user.data.username
                }
                onClick={() => {
                  this.setState({
                    confirmDelete: true,
                  });
                  // deleteBorehole(borehole.data.id).then(
                  //   function () {
                  //     history.push(
                  //       process.env.PUBLIC_URL + "/editor"
                  //     );
                  //   }
                  // );
                }}
                style={{
                  flex: 1,
                }}>
                <Icon name="trash alternate" />
                <TranslationText id="delete" />
              </Menu.Item>
            }>
            <Header
              content={<TranslationText id="deleteForever" />}
              // icon='archive'
            />
            <Modal.Content>
              <p>
                <TranslationText id="sure" />
              </p>
            </Modal.Content>
            <Modal.Actions>
              <Button
                negative
                loading={this.state.deleting}
                onClick={() => {
                  this.setState(
                    {
                      deleting: true,
                    },
                    () => {
                      deleteBorehole(borehole.data.id).then(function () {
                        history.push(process.env.PUBLIC_URL + "/editor");
                      });
                    },
                  );
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
            disabled={
              borehole.data.lock !== null &&
              borehole.data.lock.username !== user.data.username
            }
            onClick={() => {
              if (
                borehole.data.lock !== null &&
                borehole.data.lock.username === user.data.username
              ) {
                this.props.unlock(borehole.data.id);
              } else if (borehole.data.lock === null) {
                this.props.lock(borehole.data.id);
              }
            }}
            style={{
              flex: 1,
            }}>
            <Icon
              name={
                borehole.data.lock !== null &&
                moment().diff(moment(borehole.data.lock.date), "seconds") <
                  timeout * 60
                  ? "stop"
                  : "play"
              }
            />
            {borehole.data.lock !== null &&
            moment().diff(moment(borehole.data.lock.date), "seconds") <
              timeout * 60 ? (
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
  }
}

MenuEditorForm.propTypes = {
  borehole: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  lock: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  reload: PropTypes.func,
  t: PropTypes.func,
  unlock: PropTypes.func,
  user: PropTypes.object,
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
    // refresh: () => {
    //   dispatch({
    //     type: 'FSEARCH_EDITOR_FILTER_REFRESH'
    //   });
    // },
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

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation(["common"])(MenuEditorForm)),
);
