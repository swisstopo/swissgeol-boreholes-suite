import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import {
  Button,
  Checkbox,
  Header,
  Icon,
  Label,
  Modal,
} from "semantic-ui-react";

import {
  loadBorehole,
  loadWorkflows,
  patchBorehole,
  patchWorkflow,
  updateBorehole,
  updateWorkflow,
  submitWorkflow,
  rejectWorkflow,
  resetWorkflow,
} from "../../../api-lib/index";

import CommentArea from "./commentArea";
import DateText from "../dateText";
import TranslationText from "../../form/translationText";

class WorkflowForm extends React.Component {
  constructor(props) {
    super(props);
    this.load = this.load.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateAttributeDelay = false;
    this.state = {
      expanded: false,
      id: props.id,
      modal: 0,
      modalRestart: false,
      resetting: false,
    };
  }

  componentDidMount() {
    this.load(this.state.id);
  }

  componentDidUpdate(prevProps) {
    // const { refresh } = this.props;
    if (
      this.props.id !== null &&
      (this.props.id !== prevProps.id ||
        this.props.borehole.fcnt !== prevProps.borehole.fcnt)
    ) {
      this.setState(
        {
          id: this.props.id,
        },
        () => {
          this.load(this.state.id);
        },
      );
    }
  }

  load(id) {
    if (_.isInteger(id)) {
      this.setState(
        {
          expanded: false,
        },
        () => {
          this.props.loadWorkflows(id);
        },
      );
    }
  }

  handleChange(value) {
    if (
      this.props.borehole.data.lock === null ||
      this.props.borehole.data.lock.username !== this.props.user.data.username
    ) {
      alert("Borehole not locked");
    } else {
      this.props.updateWorkflow(value);
      if (this.updateAttributeDelay !== false) {
        clearTimeout(this.updateAttributeDelay);
        this.updateAttributeDelay = false;
      }
      this.updateAttributeDelay = setTimeout(() => {
        this.props.patchWorkflow(this.props.workflow.data.id, value);
      }, 900);
    }
  }

  render() {
    const { borehole, id, t, user, workflow, workflows } = this.props;

    if (_.isNil(id)) {
      return null;
    }

    const filtered = workflows.data.filter(flow => flow.finished !== null);

    const readOnly =
      borehole.data.lock === null ||
      borehole.data.lock.username !== user.data.username;

    const supplier =
      borehole.data.workgroup && borehole.data.workgroup.supplier;

    return (
      <div
        style={{
          display: "flex",
          flex: "1 1 100%",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
        }}>
        <h3>
          <TranslationText id={"flowPublication"} />
        </h3>
        {filtered.length > 1 ? (
          <div
            className="link"
            onClick={e => {
              this.setState({
                expanded: !this.state.expanded,
              });
            }}
            style={{
              fontSize: "0.8em",
              paddingBottom: "1em",
            }}>
            {this.state.expanded === false ? (
              <TranslationText id="showHistory" prepend="+ " />
            ) : (
              <TranslationText id="showHistory" prepend="- " />
            )}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 100%",
            overflowY: "auto",
          }}>
          <div
            style={{
              borderBottom:
                this.state.expanded === true
                  ? "thin solid rgba(0, 0, 0, 0.15)"
                  : null,
              overflowX: "hidden",
              flex: "1 1 100%",
            }}>
            {filtered.map((flow, idx) => (
              <div
                key={"wff-cmt-" + idx}
                style={{
                  borderBottom:
                    idx + 1 < filtered.length
                      ? "thin solid rgba(0, 0, 0, 0.30)"
                      : null,
                  display:
                    idx + 1 < filtered.length && this.state.expanded === false
                      ? "none"
                      : null,
                  marginBottom: "1em",
                  padding: "0px 0.5em 0.5em 0.5em",
                  // padding: '0.5em',
                  // margin: '0.5em 0.5em 1.5em 0.5em',
                  // boxShadow: this.state.expanded?
                  //   'rgba(0, 0, 0, 0.75) 0px 4px 8px -4px': null
                }}>
                <div
                  style={{
                    color: "#2185d0",
                    // fontWeight: 'bold'
                  }}>
                  {flow.creator.name}{" "}
                  {flow.creator.username === user.data.username ? (
                    <span
                      style={{
                        color: "#787878",
                      }}>
                      <TranslationText id="you" />
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    // color: '#787878',
                    fontSize: "0.8em",
                  }}>
                  <DateText date={flow.finished} fromnow /> -{" "}
                  <DateText date={flow.finished} hours />
                </div>
                <div
                  style={{
                    padding: "0.5em 0px",
                  }}>
                  {flow.notes !== null && flow.notes !== "" ? (
                    <CommentArea height={100} readOnly value={flow.notes} />
                  ) : (
                    <div
                      style={{
                        color: "#830000",
                        fontStyle: "italic",
                      }}>
                      <TranslationText id="noComments" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {workflow.data === null ||
            (readOnly === true && workflows.data.length > 1) ? null : (
              <div>
                <span>
                  <TranslationText id="yourcomments" />
                  &nbsp;
                  {readOnly ? (
                    <TranslationText append=")" id="disabled" prepend="(" />
                  ) : null}
                  :
                </span>
                <CommentArea
                  onChange={this.handleChange}
                  readOnly={readOnly}
                  value={workflow.data.notes}
                />
                {workflow.isPatching === true ? (
                  <div>
                    <Icon loading name="spinner" size="small" />
                    &nbsp;
                    <TranslationText id="saving" />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <h3>
          <TranslationText id={"flowPublicationStatus"} />
        </h3>
        {workflows.data.length === 0 && workflows.isFetching === true
          ? null
          : (() => {
              const status = {
                EDIT: null,
                CONTROL: null,
                VALID: null,
                PUBLIC: null,
              };

              const done = [];
              [...workflows.data].reverse().forEach(w => {
                if (done.indexOf(w.role) === -1) {
                  done.push(w.role);
                  status[w.role] = w;
                }
              });

              let current = null;
              return ["EDIT", "CONTROL", "VALID", "PUBLIC"].map((role, idx) => {
                const ret = (
                  <div
                    key={"wfl-stt-" + idx}
                    style={{
                      borderBottom:
                        status[role] !== null && status[role].finished === null
                          ? "thin solid rgb(178, 178, 178)"
                          : null,
                      padding: "0.5em 0px",
                    }}>
                    {status[role] !== null ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}>
                        <div
                          style={{
                            alignItems: "center",
                            display: "flex",
                            flexDirection: "row",
                          }}>
                          <div>
                            <Label
                              circular
                              color={
                                status[role].finished === null
                                  ? "orange"
                                  : current === true
                                  ? "red"
                                  : "green"
                              }
                            />
                          </div>
                          <div
                            style={{
                              marginLeft: "0.7em",
                              whiteSpace: "nowrap",
                            }}>
                            <div className="bdms-header">
                              <TranslationText
                                id={`status${role.toLowerCase()}`}
                              />
                            </div>
                            {(this.props.user.data.admin === true ||
                              this.props.user.data.roles.indexOf("PUBLIC") >=
                                0) &&
                            role === "EDIT" &&
                            this.props.workflow.data.role === "PUBLIC"
                              ? [
                                  <Icon
                                    key="bdms-workflow-form-push-back-1"
                                    color={readOnly ? null : "blue"}
                                    name="repeat"
                                  />,
                                  <span
                                    key="bdms-workflow-form-push-back-2"
                                    className={!readOnly ? "linker" : null}
                                    style={{
                                      marginLeft: "0.2em",
                                      color: readOnly ? "#787878" : null,
                                    }}
                                    onClick={() => {
                                      if (!readOnly) {
                                        this.setState({
                                          modalRestart: true,
                                        });
                                      }
                                    }}>
                                    <TranslationText id={"flowRestart"} />
                                  </span>,
                                ]
                              : null}
                          </div>
                          <div
                            style={{
                              flex: "1 1 100%",
                              textAlign: "right",
                            }}>
                            {current === true ? (
                              <span
                                style={{
                                  color: "red",
                                  fontSize: "0.9em",
                                }}>
                                <TranslationText id="rejected" />
                                <br />
                                <DateText date={status[role].finished} hours />
                              </span>
                            ) : status[role].finished !== null ? (
                              <span
                                style={{
                                  fontSize: "0.9em",
                                }}>
                                <TranslationText id="submitted" />
                                <br />
                                <DateText date={status[role].finished} hours />
                              </span>
                            ) : borehole.data.id !== null &&
                              user.data.workgroups
                                .find(
                                  workgroup =>
                                    workgroup.id === borehole.data.workgroup.id,
                                )
                                .roles.indexOf(borehole.data.role) === -1 ? (
                              <span
                                style={{
                                  fontSize: "0.9em",
                                }}>
                                {status[role].finished !== null
                                  ? "Review started"
                                  : "Pending review"}
                                <br />
                                <DateText date={status[role].finished} hours />
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {status[role].finished === null &&
                        borehole.data.id !== null &&
                        user.data.workgroups
                          .find(
                            workgroup =>
                              workgroup.id === borehole.data.workgroup.id,
                          )
                          .roles.indexOf(borehole.data.role) > -1 ? (
                          <div
                            style={{
                              flex: "1 1 100%",
                              padding: "0.8em 0px",
                              textAlign: "right",
                            }}>
                            <div>
                              {role !== "EDIT" ? (
                                <Button
                                  disabled={readOnly || workflows.isSubmitting}
                                  loading={workflows.isRejecting === true}
                                  negative
                                  onClick={() => {
                                    this.setState({
                                      modal: 3,
                                    });
                                  }}
                                  size="mini">
                                  <TranslationText id="reject" />
                                </Button>
                              ) : null}
                              <Button
                                disabled={readOnly || workflows.isRejecting}
                                loading={workflows.isSubmitting === true}
                                onClick={() => {
                                  this.setState({
                                    modal: 1,
                                  });
                                }}
                                secondary
                                size="mini">
                                <TranslationText id="submit" />
                              </Button>
                              {role === "PUBLIC" ? (
                                <Button
                                  disabled={readOnly || workflows.isRejecting}
                                  loading={workflows.isSubmitting === true}
                                  onClick={() => {
                                    this.setState({
                                      modal: 2,
                                    });
                                  }}
                                  secondary
                                  size="mini">
                                  <TranslationText id="public" />
                                </Button>
                              ) : null}
                              <Modal
                                // basic
                                closeIcon
                                onClose={() => {
                                  this.setState({
                                    modal: 0,
                                  });
                                }}
                                open={this.state.modal > 0}
                                size="mini">
                                <Header
                                  content={t(`version:${role}`)}
                                  // icon='archive'
                                />
                                <Modal.Content>
                                  <p>
                                    {this.state.modal === 2 ? (
                                      <TranslationText id="pubblicazione" />
                                    ) : null}
                                  </p>
                                  <p>
                                    <TranslationText id="sure" />
                                  </p>
                                </Modal.Content>
                                <Modal.Actions>
                                  {this.state.modal < 3 ? (
                                    <Button
                                      disabled={
                                        readOnly || workflows.isRejecting
                                      }
                                      loading={workflows.isSubmitting === true}
                                      onClick={() => {
                                        this.props
                                          .submitWorkflow(
                                            status[role].id,
                                            this.state.modal === 2,
                                          )
                                          .then(() => {
                                            this.setState({
                                              modal: 0,
                                            });
                                          });
                                      }}
                                      secondary>
                                      <Icon name="checkmark" />
                                      &nbsp;
                                      <TranslationText id="submit" />
                                    </Button>
                                  ) : (
                                    <Button
                                      disabled={
                                        readOnly || workflows.isSubmitting
                                      }
                                      loading={workflows.isRejecting === true}
                                      negative
                                      onClick={() => {
                                        this.props
                                          .rejectWorkflow(status[role].id)
                                          .then(() => {
                                            this.setState({
                                              modal: 0,
                                            });
                                          });
                                      }}>
                                      <Icon name="checkmark" />
                                      &nbsp;
                                      <TranslationText id="reject" />
                                    </Button>
                                  )}
                                </Modal.Actions>
                              </Modal>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        style={{
                          alignItems: "center",
                          display: "flex",
                          flexDirection: "row",
                        }}>
                        <div
                          style={{
                            whiteSpace: "nowrap",
                          }}>
                          <Label
                            circular
                            style={{
                              backgroundColor: "#909090 !important",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            marginLeft: "0.7em",
                            whiteSpace: "nowrap",
                          }}>
                          <h4 style={{ color: "#909090" }}>
                            <TranslationText
                              id={`status${role.toLowerCase()}`}
                            />
                          </h4>
                        </div>
                        <div
                          style={{
                            flex: "1 1 100%",
                            textAlign: "right",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
                if (current === null) {
                  current =
                    status[role] !== null && status[role].finished === null
                      ? true
                      : null;
                }
                return ret;
              });
            })()}
        {workflow.data !== null &&
        workflow.data.role === "PUBLIC" &&
        workflow.data.finished !== null ? (
          <div
            style={{
              textAlign: "center",
              padding: "0.5em 0px",
            }}>
            <h4>
              <TranslationText id="visibility" />
            </h4>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
              }}>
              <div
                style={{
                  flex: "1 1 100%",
                  textAlign: "right",
                  fontWeight:
                    this.props.borehole.data.visible === false ? "bold" : null,
                }}>
                <TranslationText id="hidden" />
              </div>
              <div
                style={{
                  padding: "0px 1em",
                }}>
                <Checkbox
                  checked={borehole.data.visible}
                  onChange={(e, data) => {
                    if (
                      this.props.borehole.data.lock === null ||
                      this.props.borehole.data.lock.username !==
                        this.props.user.data.username
                    ) {
                      alert("Borehole not locked");
                    } else {
                      const borehole = {
                        ...this.props.borehole.data,
                      };
                      borehole.visible = data.checked;
                      patchBorehole(
                        borehole.id,
                        "visible",
                        borehole.visible,
                      ).then(() => {
                        this.props.updateBorehole(borehole);
                      });
                    }
                  }}
                  toggle
                />
              </div>
              <div
                style={{
                  flex: "1 1 100%",
                  textAlign: "left",
                  fontWeight:
                    this.props.borehole.data.visible === true ? "bold" : null,
                }}>
                <TranslationText id="visible" />
              </div>
            </div>
            {supplier === false && (
              <div
                style={{
                  padding: "2em 1em 0px 1em",
                }}>
                <Button
                  disabled={
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  }
                  fluid
                  loading={workflows.isRejecting === true}
                  negative
                  onClick={() => {
                    this.props.rejectWorkflow(workflow.data.id);
                  }}
                  size="mini">
                  <TranslationText id="reject" />
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {
          // Modals
        }
        <Modal
          // basic
          closeIcon
          onClose={() => {
            this.setState({
              modalRestart: false,
            });
          }}
          open={this.state.modalRestart === true}
          size="mini">
          <Header
            content={t(`flowRestart`)}
            // icon='archive'
          />
          <Modal.Content>
            <p>
              <TranslationText id="sure" />
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              loading={this.state.resetting === true}
              secondary
              onClick={() => {
                this.setState(
                  {
                    resetting: true,
                  },
                  () => {
                    this.props
                      .resetWorkflow(this.props.workflow.data.id)
                      .then(() => {
                        this.setState({
                          modalRestart: false,
                          resetting: false,
                        });
                      });
                  },
                );
              }}>
              <Icon name="checkmark" />
              &nbsp;
              <TranslationText id="yes" />
            </Button>
            <Button
              negative
              onClick={() => {
                this.setState({
                  modalRestart: false,
                });
              }}>
              <TranslationText id="cancel" />
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

WorkflowForm.propTypes = {
  borehole: PropTypes.object,
  id: PropTypes.number,
  loadWorkflows: PropTypes.func,
  patchWorkflow: PropTypes.func,
  rejectWorkflow: PropTypes.func,
  submitWorkflow: PropTypes.func,
  t: PropTypes.func,
  updateBorehole: PropTypes.func,
  updateWorkflow: PropTypes.func,
  user: PropTypes.object,
  workflow: PropTypes.object,
  workflows: PropTypes.object,
};

WorkflowForm.defaultProps = {
  id: undefined,
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
    workflow: state.core_workflow,
    workflows: state.core_workflows,
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    dispatch: dispatch,
    loadWorkflows: id => {
      dispatch(loadWorkflows(id));
    },
    patchWorkflow: (id, value) => {
      dispatch(patchWorkflow(id, "notes", value));
    },
    updateWorkflow: value => {
      dispatch(updateWorkflow("notes", value));
    },
    submitWorkflow: (id, online = false) => {
      return dispatch(submitWorkflow(id, online)).then(res => {
        dispatch(loadBorehole(props.id));
      });
    },
    rejectWorkflow: id => {
      return dispatch(rejectWorkflow(id)).then(res => {
        dispatch(loadBorehole(props.id));
      });
    },
    resetWorkflow: id => {
      return dispatch(resetWorkflow(id)).then(res => {
        dispatch(loadBorehole(props.id));
      });
    },
    updateBorehole: data => {
      return dispatch(updateBorehole(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(WorkflowForm));
