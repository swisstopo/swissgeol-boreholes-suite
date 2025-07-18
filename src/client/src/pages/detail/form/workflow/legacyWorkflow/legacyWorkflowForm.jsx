import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDownIcon, RotateCcw, X } from "lucide-react";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  loadBorehole,
  loadWorkflows,
  patchWorkflow,
  rejectWorkflow,
  resetWorkflow,
  submitWorkflow,
  updateBorehole,
  updateWorkflow,
} from "../../../../../api-lib/index.js";
import { theme } from "../../../../../AppTheme.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
import { CancelButton } from "../../../../../components/buttons/buttons.js";
import DateText from "../../../../../components/legacyComponents/dateText.js";
import TranslationText from "../../../../../components/legacyComponents/translationText.jsx";
import CommentArea from "./commentArea.jsx";

class LegacyWorkflowForm extends React.Component {
  static contextType = AlertContext;

  constructor(props) {
    super(props);
    this.load = this.load.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateAttributeDelay = false;
    this.roleMap = { EDIT: "Editor", CONTROL: "Controller", VALID: "Validator", PUBLIC: "Publisher" };
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
    this.props.dispatch(loadBorehole(this.props.id));
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
    const { boreholeV2, t, user } = this.props;
    if (boreholeV2.locked === null || boreholeV2.lockedById !== user.data.id) {
      this.context.showAlert(t("common:errorStartEditing"), "error");
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

  expandHistory() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { borehole: legacyBorehole, boreholeV2, id, t, user, workflow, workflows } = this.props;

    if (_.isNil(id)) {
      return null;
    }

    const filtered = workflows.data.filter(flow => flow.finished !== null);
    const readOnly = boreholeV2.locked === null || boreholeV2.lockedById !== user.data.id;
    if (legacyBorehole.isFetching || workflow.isFetching) {
      return;
    }

    return (
      <Stack direction="row" sx={{ overflow: "auto" }}>
        <Stack
          direction="column"
          sx={{
            p: 4,
            flex: "1 1 100%",
            height: "100%",
            maxWidth: "800px",
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${theme.palette.border.light}`,
          }}>
          <Typography variant="h4">
            <TranslationText id={"flowPublication"} />
          </Typography>
          {filtered.length > 1 ? (
            <Accordion expanded={this.state.expanded} onChange={() => this.expandHistory()}>
              <AccordionSummary
                expandIcon={<ChevronDownIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{
                  fontSize: "0.8em",
                  paddingBottom: "1em",
                }}>
                <Typography>
                  {this.state.expanded === false ? (
                    <TranslationText id="showHistory" prepend="+ " />
                  ) : (
                    <TranslationText id="showHistory" prepend="- " />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
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
                          {t("you")}
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
                          {t("noComments")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
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
              {workflow.data === null || (readOnly === true && workflows.data.length > 1) ? null : (
                <div>
                  <span>
                    {t("yourcomments")}
                    &nbsp;
                    {readOnly ? <TranslationText append=")" id="disabled" prepend="(" /> : null}:
                  </span>
                  <CommentArea
                    height={100}
                    onChange={this.handleChange}
                    readOnly={readOnly}
                    value={workflow.data.notes}
                  />
                  {workflow.isPatching && <div>{t("saving")}</div>}
                </div>
              )}
            </div>
          </div>
          <Typography variant="h5" sx={{ marginTop: 1 }}>
            <TranslationText id={"flowPublicationStatus"} />
          </Typography>
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
                              <Box
                                data-cy={`workflow_status_color_${role.toLowerCase()}`}
                                sx={{
                                  height: 20,
                                  width: 20,
                                  borderRadius: 5,
                                  backgroundColor:
                                    status[role].finished === null
                                      ? theme.palette.warning.main
                                      : current === true
                                        ? theme.palette.error.main
                                        : theme.palette.success.main,
                                }}
                              />
                            </div>
                            <div
                              style={{
                                marginLeft: "0.7em",
                                whiteSpace: "nowrap",
                              }}>
                              <div className="bdms-header" data-cy="workflow_status_header">
                                <TranslationText id={`status${this.roleMap[role].toLowerCase()}`} />
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
                                  {t("rejected")}
                                  <br />
                                  <DateText date={status[role].finished} hours />
                                </span>
                              ) : status[role].finished !== null ? (
                                <span
                                  style={{
                                    fontSize: "0.9em",
                                  }}>
                                  {t("submitted")}
                                  <br />
                                  <DateText date={status[role].finished} hours />
                                </span>
                              ) : legacyBorehole.data.id !== null &&
                                user.data.workgroups
                                  .find(workgroup => workgroup.id === legacyBorehole.data.workgroup.id)
                                  ?.roles.indexOf(legacyBorehole.data.role) === -1 ? (
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
                                legacyBorehole.data.id !== null &&
                                user.data.workgroups
                                  .find(workgroup => workgroup.id === legacyBorehole.data.workgroup.id)
                                  ?.roles.indexOf(legacyBorehole.data.role) > -1 &&
                                (status[role].finished === null ||
                                  (status[role].finished && role === "PUBLIC" && current === null)) && (
                                  <Button
                                    sx={{ marginRight: 1 }}
                                    data-cy="workflow_restart"
                                    disabled={readOnly}
                                    variant="outlined"
                                    startIcon={<RotateCcw />}
                                    onClick={() => {
                                      this.setState({
                                        modalRestart: true,
                                      });
                                    }}>
                                    {workflows.isRejecting ? (
                                      <CircularProgress size={22} color="inherit" />
                                    ) : (
                                      t("flowRestart")
                                    )}
                                  </Button>
                                )}
                              {status[role].finished === null &&
                                legacyBorehole.data.id !== null &&
                                user.data.workgroups
                                  .find(workgroup => workgroup.id === legacyBorehole.data.workgroup.id)
                                  ?.roles.indexOf(legacyBorehole.data.role) > -1 && (
                                  <>
                                    {role !== "EDIT" && (
                                      <Button
                                        startIcon={<X />}
                                        variant="outlined"
                                        sx={{ marginRight: 1 }}
                                        disabled={readOnly || workflows.isSubmitting}
                                        onClick={() => {
                                          this.setState({
                                            modal: 3,
                                          });
                                        }}>
                                        {workflows.isRejecting ? (
                                          <CircularProgress size={22} color="inherit" />
                                        ) : (
                                          t("reject")
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      variant="contained"
                                      data-cy="workflow_submit"
                                      disabled={readOnly || workflows.isRejecting}
                                      onClick={() => {
                                        this.setState({
                                          modal: 1,
                                        });
                                      }}>
                                      {workflows.isSubmitting ? (
                                        <CircularProgress size={22} color="inherit" />
                                      ) : (
                                        t("submit")
                                      )}
                                    </Button>
                                    <Dialog
                                      onClose={() => {
                                        this.setState({
                                          modal: 0,
                                        });
                                      }}
                                      open={this.state.modal > 0}
                                      maxWidth="xs"
                                      fullWidth>
                                      <DialogTitle>
                                        <Typography variant="h4">
                                          {t(`status-submit-msg-${role.toLowerCase()}`)}
                                        </Typography>
                                      </DialogTitle>
                                      <DialogContent>
                                        <Box pt={2}>
                                          <Typography>{t("sure")}</Typography>
                                        </Box>
                                      </DialogContent>
                                      <DialogActions>
                                        {this.state.modal < 3 ? (
                                          <Button
                                            variant="contained"
                                            data-cy="workflow_dialog_submit"
                                            onClick={() => {
                                              this.props
                                                .submitWorkflow(status[role].id, this.state.modal === 2)
                                                .then(() => {
                                                  this.setState({
                                                    modal: 0,
                                                  });
                                                });
                                            }}
                                            disabled={readOnly || workflows.isRejecting}>
                                            {workflows.isSubmitting ? (
                                              <CircularProgress size={22} color="inherit" />
                                            ) : (
                                              t("submit")
                                            )}
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="contained"
                                            startIcon={<X />}
                                            onClick={() => {
                                              this.props.rejectWorkflow(status[role].id).then(() => {
                                                this.setState({
                                                  modal: 0,
                                                });
                                              });
                                            }}
                                            disabled={readOnly || workflows.isSubmitting}>
                                            {workflows.isRejecting ? (
                                              <CircularProgress size={22} color="inherit" />
                                            ) : (
                                              t("reject")
                                            )}
                                          </Button>
                                        )}
                                      </DialogActions>
                                    </Dialog>
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
                            <Box
                              sx={{
                                height: 20,
                                width: 20,
                                borderRadius: 5,
                                backgroundColor: theme.palette.background.darkgrey + " !important",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              marginLeft: "0.7em",
                              whiteSpace: "nowrap",
                            }}>
                            <Typography variant="h6" sx={{ color: "#909090" }}>
                              <TranslationText id={`status${this.roleMap[role].toLowerCase()}`} />
                            </Typography>
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
          <Dialog
            onClose={() => {
              this.setState({
                modalRestart: false,
              });
            }}
            open={this.state.modalRestart === true}
            maxWidth="xs"
            fullWidth>
            <DialogTitle>
              <Typography variant="h4">{t(`flowRestart`)}</Typography>
            </DialogTitle>
            <DialogContent>
              <Box pt={2}>
                <Typography>{t("sure")}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                sx={{ width: "100px", mr: 1 }}
                data-cy="workflow_dialog_confirm_restart"
                variant="contained"
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
                {this.state.resetting ? <CircularProgress size={22} color="inherit" /> : t("yes")}
              </Button>
              <CancelButton
                onClick={() => {
                  this.setState({
                    modalRestart: false,
                  });
                }}
              />
            </DialogActions>
          </Dialog>
        </Stack>
      </Stack>
    );
  }
}

LegacyWorkflowForm.propTypes = {
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

LegacyWorkflowForm.defaultProps = {
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

const ConnectedWorkflowForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(LegacyWorkflowForm));
export default ConnectedWorkflowForm;
