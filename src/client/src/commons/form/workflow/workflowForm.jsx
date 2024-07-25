import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import { Button, Header, Icon, Label, Modal } from "semantic-ui-react";

import {
  loadBorehole,
  loadWorkflows,
  patchWorkflow,
  rejectWorkflow,
  resetWorkflow,
  submitWorkflow,
  updateBorehole,
  updateWorkflow,
} from "../../../api-lib/index";
import { AlertContext } from "../../../components/alert/alertContext";
import CommentArea from "./commentArea";
import DateText from "../dateText";
import TranslationText from "../../form/translationText";
import { theme } from "../../../AppTheme";
import { Stack } from "@mui/material";

class WorkflowForm extends React.Component {
  static contextType = AlertContext;

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
    if (
      this.props.id !== null &&
      (this.props.id !== prevProps.id || this.props.borehole.fetchCount !== prevProps.borehole.fetchCount)
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
    const { t } = this.props;
    if (this.props.borehole.data.lock === null || this.props.borehole.data.lock.id !== this.props.user.data.id) {
      this.context.error(t("common:errorStartEditing"));
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
    const readOnly = borehole.data.lock === null || borehole.data.lock.id !== user.data.id;
    if (borehole.isFetching || workflow.isFetching) {
      return;
    }

    return (
      <Stack direction="row" sx={{ overflow: "auto" }}>
        <div
          style={{
            display: "flex",
            padding: "50px",
            flex: "1 1 100%",
            flexDirection: "column",
            height: "100%",
            maxWidth: "800px",
          }}>
          <h3>
            <TranslationText id={"flowPublication"} />
          </h3>
          {filtered.length > 1 ? (
            <div
              className="link"
              onClick={() => {
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
              minHeight: "10em",
              overflowY: "auto",
            }}>
            <div
              style={{
                borderBottom: this.state.expanded === true ? "thin solid rgba(0, 0, 0, 0.15)" : null,
                overflowX: "hidden",
                flex: "1 1 100%",
              }}>
              {filtered.map((flow, idx) => (
                <div
                  key={"wff-cmt-" + idx}
                  style={{
                    borderBottom: idx + 1 < filtered.length ? "thin solid rgba(0, 0, 0, 0.30)" : null,
                    display: idx + 1 < filtered.length && this.state.expanded === false ? "none" : null,
                    marginBottom: "1em",
                    padding: "0px 0.5em 0.5em 0.5em",
                  }}>
                  <div
                    style={{
                      color: "#2185d0",
                    }}>
                    {flow.creator.name}{" "}
                    {flow.creator.id === user.data.id ? (
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
                      fontSize: "0.8em",
                    }}>
                    <DateText date={flow.finished} fromnow /> - <DateText date={flow.finished} hours />
                  </div>
                  <div
                    style={{
                      padding: "0.5em 0px",
                      maxHeight: "120px",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}>
                    {flow.notes !== null && flow.notes !== "" ? (
                      <CommentArea readOnly value={flow.notes} border="none" height={0} />
                    ) : (
                      <div
                        style={{
                          color: theme.palette.error.main,
                          fontStyle: "italic",
                        }}>
                        <TranslationText id="noComments" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {workflow.data === null || (readOnly === true && workflows.data.length > 1) ? null : (
                <div>
                  <span>
                    <TranslationText id="yourcomments" />
                    &nbsp;
                    {readOnly ? <TranslationText append=")" id="disabled" prepend="(" /> : null}:
                  </span>
                  <CommentArea
                    height={100}
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
                                data-cy={`workflow_status_color_${role.toLowerCase()}`}
                                color={status[role].finished === null ? "orange" : current === true ? "red" : "green"}
                              />
                            </div>
                            <div
                              style={{
                                marginLeft: "0.7em",
                                whiteSpace: "nowrap",
                              }}>
                              <div className="bdms-header" data-cy="workflow_status_header">
                                <TranslationText id={`status${role.toLowerCase()}`} />
                              </div>
                            </div>
                            <div
                              style={{
                                flex: "1 1 100%",
                                textAlign: "right",
                              }}>
                              {current === true ? (
                                <span
                                  style={{
                                    color: theme.palette.success.main,
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
                                  .find(workgroup => workgroup.id === borehole.data.workgroup.id)
                                  ?.roles.indexOf(borehole.data.role) === -1 ? (
                                <span
                                  style={{
                                    fontSize: "0.9em",
                                  }}>
                                  {status[role].finished !== null ? "Review started" : "Pending review"}
                                  <br />
                                  <DateText date={status[role].finished} hours />
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div
                            style={{
                              flex: "1 1 100%",
                              padding: "0.8em 0px",
                              textAlign: "right",
                            }}>
                            <>
                              {role !== "EDIT" &&
                                borehole.data.id !== null &&
                                user.data.workgroups
                                  .find(workgroup => workgroup.id === borehole.data.workgroup.id)
                                  ?.roles.indexOf(borehole.data.role) > -1 &&
                                (status[role].finished === null ||
                                  (status[role].finished && role === "PUBLIC" && current === null)) && (
                                  <Button
                                    data-cy="workflow_restart"
                                    disabled={readOnly}
                                    loading={workflows.isRejecting === true}
                                    primary
                                    onClick={() => {
                                      this.setState({
                                        modalRestart: true,
                                      });
                                    }}
                                    size="mini">
                                    <TranslationText id="flowRestart" />
                                  </Button>
                                )}
                              {status[role].finished === null &&
                                borehole.data.id !== null &&
                                user.data.workgroups
                                  .find(workgroup => workgroup.id === borehole.data.workgroup.id)
                                  ?.roles.indexOf(borehole.data.role) > -1 && (
                                  <>
                                    {role !== "EDIT" && (
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
                                    )}

                                    <Button
                                      disabled={readOnly || workflows.isRejecting}
                                      data-cy="workflow_submit"
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
                                      <Header content={t(`status-submit-msg-${role.toLowerCase()}`)} />
                                      <Modal.Content>
                                        <p>
                                          <TranslationText id="sure" />
                                        </p>
                                      </Modal.Content>
                                      <Modal.Actions>
                                        {this.state.modal < 3 ? (
                                          <Button
                                            data-cy="workflow_dialog_submit"
                                            disabled={readOnly || workflows.isRejecting}
                                            loading={workflows.isSubmitting === true}
                                            onClick={() => {
                                              this.props
                                                .submitWorkflow(status[role].id, this.state.modal === 2)
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
                                            disabled={readOnly || workflows.isSubmitting}
                                            loading={workflows.isRejecting === true}
                                            negative
                                            onClick={() => {
                                              this.props.rejectWorkflow(status[role].id).then(() => {
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
                                  </>
                                )}
                            </>
                          </div>
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
                                backgroundColor: theme.palette.background.lightgrey + " !important",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              marginLeft: "0.7em",
                              whiteSpace: "nowrap",
                            }}>
                            <h4 style={{ color: "#909090" }}>
                              <TranslationText id={`status${role.toLowerCase()}`} />
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
                    current = status[role] !== null && status[role].finished === null ? true : null;
                  }
                  return ret;
                });
              })()}
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
            <Header content={t(`flowRestart`)} />
            <Modal.Content>
              <p>
                <TranslationText id="sure" />
              </p>
            </Modal.Content>
            <Modal.Actions>
              <Button
                loading={this.state.resetting === true}
                data-cy="workflow_dialog_confirm_restart"
                secondary
                onClick={() => {
                  this.setState(
                    {
                      resetting: true,
                    },
                    () => {
                      this.props.resetWorkflow(this.props.workflow.data.id).then(() => {
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
      </Stack>
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
      return dispatch(submitWorkflow(id, online)).then(() => {
        dispatch(loadBorehole(props.id));
      });
    },
    rejectWorkflow: id => {
      return dispatch(rejectWorkflow(id)).then(() => {
        dispatch(loadBorehole(props.id));
      });
    },
    resetWorkflow: id => {
      return dispatch(resetWorkflow(id)).then(() => {
        dispatch(loadBorehole(props.id));
      });
    },
    updateBorehole: data => {
      return dispatch(updateBorehole(data));
    },
  };
};

const ConnectedWorkflowForm = connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(WorkflowForm));
export default ConnectedWorkflowForm;
