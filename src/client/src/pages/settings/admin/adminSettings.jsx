import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Button, Checkbox, Form, Icon, Input, Label, Loader, Modal, Table } from "semantic-ui-react";
import PropTypes from "prop-types";
import { deleteUser, fetchUser, fetchUsers, updateUser } from "../../../api/user";
import {
  createWorkgroup,
  deleteWorkgroup,
  fetchWorkgroups,
  setWorkgroupRole,
  updateWorkgroup,
} from "../../../api/workgroup";
import { AlertContext } from "../../../components/alert/alertContext";
import DateText from "../../../components/legacyComponents/dateText.js";
import TranslationText from "../../../components/legacyComponents/translationText.jsx";
import { WorkgroupRoleSettings } from "./workgroupRoleSettings";

class AdminSettings extends React.Component {
  static contextType = AlertContext;

  constructor(props) {
    super(props);
    this.setRole = this.setRole.bind(this);
    this.state = {
      deleteUser: null,
      deleteWorkgroup: null,
      usersFilter: "enabled", // 'all', 'enabled' or 'disabled',
      usersSearch: "",
      workgroupFilter: "enabled", // 'all', 'enabled' or 'disabled',
      workgroupsSearch: "",
      users: null,
      workgroups: null,

      roleUpdate: false,

      user: null,
      uId: null,
      uAdmin: false,
      uUsername: "",
      uFirstname: "",
      uLastname: "",
      uDisabled: null,

      workgroup: null,
      wId: null,
      wName: "",
      wDisabled: "",
    };
    this.reset = this.reset.bind(this);
    this.listUsers = this.listUsers.bind(this);
    this.listWorkgroups = this.listWorkgroups.bind(this);
  }

  componentDidMount() {
    this.listUsers();
    this.listWorkgroups();
  }

  reset(state, andThen) {
    this.setState(
      {
        user: null,
        uId: null,
        uUsername: "",
        uFirstname: "",
        uLastname: "",
        uDisabled: null,
        uAdmin: false,
        ...state,
      },
      () => {
        if (andThen !== undefined) {
          andThen();
        }
      },
    );
  }

  resetWorkgroup(state, andThen) {
    this.setState(
      {
        workgroup: null,
        wId: null,
        wName: "",
        wDisabled: null,
        ...state,
      },
      () => {
        if (andThen !== undefined) {
          andThen();
        }
      },
    );
  }

  async listWorkgroups(reloadUser) {
    const workgroups = await fetchWorkgroups();
    this.setState({
      workgroups: workgroups,
    });

    // immediately update currently selected workgroup.
    if (reloadUser) {
      await fetchUser(this.state.user.id).then(user => {
        this.setState({
          user: user,
        });
      });
    }
  }

  async listUsers() {
    const users = await fetchUsers();
    this.setState({
      users: users,
    });

    // immediately update currently selected user.
    if (this.state.user) {
      this.setState({ user: users.find(u => u.id === this.state.user.id) });
    }
  }

  setRole(uwg, workgroup, role) {
    // Special handling for publisher role name in API v1 and v2
    if (role === "PUBLIC") role = "Publisher";
    this.setState(
      {
        roleUpdate: true,
      },
      () => {
        let isRoleActive = uwg !== undefined && uwg.some(x => x.role === role);
        setWorkgroupRole(this.state.user.id, workgroup.id, role, !isRoleActive).then(() => {
          this.listUsers();
        });
      },
    );
  }

  render() {
    const { t } = this.props;
    return (
      <div
        style={{
          padding: "2em",
          flex: 1,
          display: "flex",
          flexDirection: "row",
        }}>
        <div
          style={{
            flex: "1 1 100%",
            marginRight: "0.5em",
          }}>
          <Form>
            <Form.Group widths="equal">
              <Form.Field>
                <label>{t("username")}</label>
                <div
                  data-cy="administration-username-label"
                  className="ui fluid input"
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    height: "35px",
                  }}>
                  {this.state.uUsername || "N/A"}
                </div>
              </Form.Field>
              <Form.Field>
                <label>{t("firstname")}</label>
                <div
                  data-cy="administration-firstname-label"
                  className="ui fluid input"
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    height: "35px",
                  }}>
                  {this.state.uFirstname || "N/A"}
                </div>
              </Form.Field>
              <Form.Field>
                <label>{t("lastname")}</label>
                <div
                  data-cy="administration-lastname-label"
                  className="ui fluid input"
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    height: "35px",
                  }}>
                  {this.state.uLastname || "N/A"}
                </div>
              </Form.Field>
              <Form.Field>
                <label>{t("admin")}</label>
                <div
                  className="ui fluid input"
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    height: "38px",
                  }}>
                  <div
                    style={{
                      flex: "1 1 100%",
                    }}
                    title={
                      this.state.uId !== null && this.props.user.data.name === this.state.uUsername
                        ? t("disabled")
                        : null
                    }>
                    <Checkbox
                      data-cy="administration-admin-checkbox"
                      checked={this.state.uAdmin}
                      disabled={this.state.uId == null}
                      onChange={() => {
                        this.setState({
                          uAdmin: !this.state.uAdmin,
                        });
                      }}
                      toggle
                    />
                  </div>
                </div>
              </Form.Field>
              <div
                style={{
                  flex: "0 0 0% !important",
                }}>
                <Form.Button
                  icon
                  data-cy="administration-save-user-button"
                  label="&nbsp;"
                  disabled={this.state.uId == null}
                  onClick={() => {
                    const user = this.state.user;
                    user.isAdmin = this.state.uAdmin;
                    updateUser(user).then(() => {
                      this.listUsers();
                    });
                  }}>
                  <Icon name="save" />
                </Form.Button>
              </div>
            </Form.Group>
          </Form>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
            }}>
            {this.state.usersFilter !== "all" || this.state.usersSearch !== "" ? (
              <div
                className="linker link"
                onClick={() => {
                  this.setState({
                    usersFilter: "all",
                    usersSearch: "",
                  });
                }}
                style={{
                  marginRight: "1em",
                  whiteSpace: "nowrap",
                }}>
                <TranslationText extra={{ what: t("all") }} id="show" />
              </div>
            ) : null}
            {this.state.usersFilter !== "enabled" && this.state.usersSearch === "" ? (
              <div
                className="linker link"
                onClick={() => {
                  this.setState({
                    usersFilter: "enabled",
                  });
                }}
                style={{
                  marginRight: "1em",
                  whiteSpace: "nowrap",
                }}>
                <TranslationText extra={{ what: t("enabled") }} id="show" />
              </div>
            ) : null}
            {this.state.usersFilter !== "disabled" && this.state.usersSearch === "" ? (
              <div
                className="linker link"
                onClick={() => {
                  this.setState({
                    usersFilter: "disabled",
                  });
                }}
                style={{
                  marginRight: "1em",
                  whiteSpace: "nowrap",
                }}>
                <TranslationText extra={{ what: t("disabled") }} id="show" />
              </div>
            ) : null}
            <div style={{ flex: "1 1 100%" }} />
            <div>
              <Input
                icon="search"
                onChange={e => {
                  this.reset({
                    usersSearch: e.target.value,
                  });
                }}
                placeholder={t("search")}
                size="mini"
                value={this.state.usersSearch}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "1em",
              maxHeight: "400px",
              overflowY: "auto",
            }}>
            <Modal
              inverted
              onClose={() => {
                this.setState({
                  deleteUser: null,
                });
              }}
              open={this.state.deleteUser !== null}
              size="tiny">
              <Modal.Header>
                {this.state.deleteUser !== null && this.state.deleteUser.disabledAt !== null
                  ? t("enabling", { what: t("user") })
                  : t("disabling", { what: t("user") })}
              </Modal.Header>
              <Modal.Content>
                {this.state.deleteUser === null ? null : this.state.deleteUser.disabledAt !== null ? (
                  <Modal.Description>
                    <p>
                      <TranslationText extra={{ user: this.state.deleteUser.name }} id="msgEnablingUser" />
                    </p>
                  </Modal.Description>
                ) : this.state.deleteUser.deletable ? (
                  <Modal.Description>
                    <p>{t("msgDeleteUser")}</p>
                    <ul>
                      <li>
                        <span
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}>
                          {t("disable")}:
                        </span>
                        <br />
                        {t("msgReenablingUserTip")}
                        <br />
                        &nbsp;
                      </li>
                      <li>
                        <span
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}>
                          {t("deleteForever")}
                        </span>
                        <br />
                        {t("msgDeletingUserTip")}
                      </li>
                    </ul>
                  </Modal.Description>
                ) : (
                  <Modal.Description>
                    <p>{t("msgDisablingUser")}</p>
                    <ul>
                      <li>
                        <span
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}>
                          {t("msgDisablingUser")}
                          {t("disable")}:
                        </span>
                        <br />
                        {t("msgReenablingUserTip")}
                      </li>
                    </ul>
                  </Modal.Description>
                )}
              </Modal.Content>
              <Modal.Actions>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}>
                  <Button
                    basic
                    color="black"
                    onClick={() => {
                      this.setState({
                        deleteUser: null,
                      });
                    }}>
                    <span
                      style={{
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}>
                      {t("cancel")}
                    </span>
                  </Button>
                  <div style={{ flex: "1 1 100%" }} />
                  {this.state.deleteUser === null ? null : this.state.deleteUser.isDisabled ? (
                    <Button
                      data-cy="enable-user-button"
                      onClick={() => {
                        const user = this.state.deleteUser;
                        user.disabledAt = null;
                        updateUser(user).then(() => {
                          this.setState(
                            {
                              deleteUser: null,
                            },
                            () => {
                              this.listUsers();
                            },
                          );
                        });
                      }}
                      secondary>
                      <span
                        style={{
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}>
                        {t("enable")}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      data-cy="disable-user-button"
                      onClick={() => {
                        const user = this.state.deleteUser;
                        user.disabledAt = Date.now();
                        updateUser(user).then(() => {
                          this.reset(
                            {
                              deleteUser: null,
                            },
                            this.listUsers,
                          );
                        });
                      }}
                      secondary>
                      <span
                        style={{
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}>
                        {t("disable")}
                      </span>
                    </Button>
                  )}
                  {this.state.deleteUser !== null &&
                  this.state.deleteUser.disabledAt === null &&
                  this.state.deleteUser.deletable ? (
                    <Button
                      data-cy="permanently-delete-user-button"
                      color="red"
                      onClick={() => {
                        deleteUser(this.state.deleteUser.id).then(() => {
                          this.reset(
                            {
                              deleteUser: null,
                            },
                            this.listUsers,
                          );
                        });
                      }}>
                      <span
                        style={{
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}>
                        {t("deleteForever")}
                      </span>
                    </Button>
                  ) : null}
                </div>
              </Modal.Actions>
            </Modal>
            {this.state.users ? (
              <Table celled compact selectable size="small">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>{t("username")}</Table.HeaderCell>
                    <Table.HeaderCell>{t("firstname")}</Table.HeaderCell>
                    <Table.HeaderCell>{t("lastname")}</Table.HeaderCell>
                    <Table.HeaderCell
                      colSpan="2"
                      style={{
                        width: "4em",
                      }}>
                      {t("admin")}
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body data-cy="user-list-table-body">
                  {this.state.users &&
                    this.state.users?.map(currentUser =>
                      (this.state.usersSearch !== "" &&
                        (currentUser.name.toUpperCase().includes(this.state.usersSearch.toUpperCase()) ||
                          currentUser.firstName.toUpperCase().includes(this.state.usersSearch.toUpperCase()) ||
                          currentUser.lastName.toUpperCase().includes(this.state.usersSearch.toUpperCase()))) ||
                      (this.state.usersSearch === "" &&
                        (this.state.usersFilter === "all" ||
                          (this.state.usersFilter === "disabled" && currentUser.disabledAt !== null) ||
                          (this.state.usersFilter === "enabled" && currentUser.disabledAt === null))) ? (
                        <Table.Row
                          active={this.state.uId === currentUser.id}
                          error={currentUser.disabledAt !== null}
                          key={"stng-1-" + currentUser.id}
                          onClick={() => {
                            if (this.state.uId === currentUser.id) {
                              this.reset();
                            } else {
                              this.setState({
                                user: currentUser,
                                uId: currentUser.id,
                                uAdmin: currentUser.isAdmin,
                                uUsername: currentUser.name,
                                uFirstname: currentUser.firstName,
                                uLastname: currentUser.lastName,
                                uDisabled: currentUser.disabledAt,
                              });
                            }
                          }}>
                          <Table.Cell>
                            {currentUser.disabledAt !== null ? (
                              <Label
                                circular
                                color={"red"}
                                empty
                                style={{
                                  marginRight: "1em",
                                }}
                              />
                            ) : null}
                            {currentUser.name}{" "}
                            {currentUser.disabledAt !== null ? (
                              <span
                                style={{
                                  color: "#787878",
                                  fontStyle: "italic",
                                  marginLeft: "0.5em",
                                }}>
                                {t("disabled")}
                                &nbsp;
                                <DateText date={currentUser.disabledAt} fromnow />
                                &nbsp;(
                                <DateText date={currentUser.disabledAt} hours />)
                              </span>
                            ) : null}
                          </Table.Cell>
                          <Table.Cell>{currentUser.firstName}</Table.Cell>
                          <Table.Cell>{currentUser.lastName}</Table.Cell>
                          <Table.Cell textAlign="center">
                            {currentUser.isAdmin === true ? t("yes") : t("no")}
                          </Table.Cell>
                          <Table.Cell
                            style={{
                              textAlign: "center",
                              width: "4em",
                            }}>
                            <span
                              className="linker link"
                              onClick={e => {
                                e.stopPropagation();
                                this.setState({
                                  deleteUser: currentUser,
                                });
                              }}>
                              {currentUser.disabledAt !== null ? t("enable") : t("disable")}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ) : null,
                    )}
                </Table.Body>
              </Table>
            ) : (
              <Loader active />
            )}
          </div>
        </div>
        <div
          style={{
            flex: "1 1 100%",
            marginLeft: "0.5em",
          }}>
          {this.state.user !== null ? (
            <div>
              <div
                style={{
                  marginBottom: "0.5em",
                }}>
                {this.state.workgroup !== null ? (
                  <span
                    className="linker link"
                    onClick={() => {
                      this.resetWorkgroup();
                    }}>
                    <TranslationText extra={{ what: "workgroup" }} id="new" />
                  </span>
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
              <Form autoComplete="off">
                <Form.Group autoComplete="off" widths="equal">
                  <Form.Input
                    fluid
                    label={t("workgroup")}
                    onChange={e => {
                      this.setState({
                        wName: e.target.value,
                      });
                    }}
                    placeholder={t("workgroup")}
                    value={this.state.wName}
                  />
                  <div
                    style={{
                      flex: "0 0 0% !important",
                    }}>
                    <Form.Button
                      icon
                      label="&nbsp;"
                      onClick={() => {
                        if (this.state.wId === null) {
                          createWorkgroup({ name: this.state.wName }).then(() => {
                            this.listWorkgroups(true);
                          });
                        } else {
                          const workgroup = this.state.workgroup;
                          workgroup.name = this.state.wName;
                          updateWorkgroup(workgroup).then(() => {
                            this.listWorkgroups(true);
                          });
                        }
                      }}>
                      <Icon name="save" />
                    </Form.Button>
                  </div>
                </Form.Group>
              </Form>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "row",
                }}>
                {this.state.workgroupFilter !== "all" || this.state.workgroupsSearch !== "" ? (
                  <div
                    className="linker link"
                    onClick={() => {
                      this.setState({
                        workgroupFilter: "all",
                        workgroupsSearch: "",
                      });
                    }}
                    style={{
                      marginRight: "1em",
                      whiteSpace: "nowrap",
                    }}>
                    <TranslationText extra={{ what: t("all") }} id="show" />
                  </div>
                ) : null}
                {this.state.workgroupFilter !== "enabled" && this.state.workgroupsSearch === "" ? (
                  <div
                    className="linker link"
                    onClick={() => {
                      this.setState({
                        workgroupFilter: "enabled",
                      });
                    }}
                    style={{
                      marginRight: "1em",
                      whiteSpace: "nowrap",
                    }}>
                    <TranslationText extra={{ what: t("enabled") }} id="show" />
                  </div>
                ) : null}
                {this.state.workgroupFilter !== "disabled" && this.state.workgroupsSearch === "" ? (
                  <div
                    className="linker link"
                    onClick={() => {
                      this.setState({
                        workgroupFilter: "disabled",
                      });
                    }}
                    style={{
                      marginRight: "1em",
                      whiteSpace: "nowrap",
                    }}>
                    <TranslationText extra={{ what: t("disabled") }} id="show" />
                  </div>
                ) : null}
                <div style={{ flex: "1 1 100%" }} />
                <div>
                  <Input
                    icon="search"
                    onChange={e => {
                      this.resetWorkgroup({
                        workgroupsSearch: e.target.value,
                      });
                    }}
                    placeholder={t("search")}
                    size="mini"
                    value={this.state.workgroupsSearch}
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: "1em",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}>
                <Modal
                  onClose={() => {
                    this.setState({
                      deleteWorkgroup: null,
                    });
                  }}
                  open={this.state.deleteWorkgroup !== null}
                  size="tiny">
                  <Modal.Header>
                    {this.state.deleteWorkgroup !== null && this.state.deleteWorkgroup.disabledAt !== null ? (
                      <TranslationText extra={{ what: t("workgroup") }} id="enabling" />
                    ) : (
                      <TranslationText extra={{ what: t("workgroup") }} id="disabling" />
                    )}
                  </Modal.Header>
                  <Modal.Content>
                    {this.state.deleteWorkgroup === null ? null : this.state.deleteWorkgroup.disabledAt !== null ? (
                      <Modal.Description>
                        <p>
                          <TranslationText
                            extra={{
                              workgroup: this.state.deleteWorkgroup.name,
                            }}
                            id="msgEnablingWorkgroup"
                          />
                        </p>
                      </Modal.Description>
                    ) : this.state.deleteWorkgroup.boreholeCount === 0 ? (
                      <Modal.Description>
                        <p>{t("msgWorkgroupCanBeDeleted")}</p>
                        <ul>
                          <li>
                            <span
                              style={{
                                fontWeight: "bold",
                                textTransform: "capitalize",
                              }}>
                              {t("disable")}
                            </span>
                            <br />
                            {t("msgReenablingWorkgroupTip")}
                            <br />
                            &nbsp;
                          </li>
                          <li>
                            <span
                              style={{
                                fontWeight: "bold",
                                textTransform: "capitalize",
                              }}>
                              {t("deleteForever")}:
                            </span>
                            <br />
                            {t("msgDeletingWorkgroupTip")}
                          </li>
                        </ul>
                      </Modal.Description>
                    ) : (
                      <Modal.Description>
                        <p>{t("msgDisablingWorkgroup")}</p>
                        <ul>
                          <li>
                            <span
                              style={{
                                fontWeight: "bold",
                                textTransform: "capitalize",
                              }}>
                              {t("disable")}:
                            </span>
                            <br />
                            {t("msgReenablingWorkgroupTip")}
                          </li>
                        </ul>
                      </Modal.Description>
                    )}
                  </Modal.Content>
                  <Modal.Actions>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}>
                      <Button
                        onClick={() => {
                          this.setState({
                            deleteWorkgroup: null,
                          });
                        }}>
                        <span
                          style={{
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                          }}>
                          {t("cancel")}
                        </span>
                      </Button>
                      <div style={{ flex: "1 1 100%" }} />
                      {this.state.deleteWorkgroup === null ? null : this.state.deleteWorkgroup.disabledAt !== null ? (
                        <Button
                          onClick={() => {
                            const workgroup = this.state.deleteWorkgroup;
                            workgroup.disabledAt = null;
                            updateWorkgroup(workgroup).then(() => {
                              this.setState(
                                {
                                  deleteWorkgroup: null,
                                },
                                () => {
                                  this.listWorkgroups(true);
                                },
                              );
                            });
                          }}
                          secondary>
                          <span
                            style={{
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                            }}>
                            {t("enable")}
                          </span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            const workgroup = this.state.deleteWorkgroup;
                            workgroup.disabledAt = Date.now();
                            updateWorkgroup(workgroup).then(() => {
                              this.resetWorkgroup(
                                {
                                  deleteWorkgroup: null,
                                },
                                () => {
                                  this.listWorkgroups(true);
                                },
                              );
                            });
                          }}
                          secondary>
                          <span
                            style={{
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                            }}>
                            {t("disable")}
                          </span>
                        </Button>
                      )}
                      {this.state.deleteWorkgroup !== null &&
                      this.state.deleteWorkgroup.disabled === null &&
                      this.state.deleteWorkgroup.boreholeCount === 0 ? (
                        <Button
                          color="red"
                          onClick={() => {
                            deleteWorkgroup(this.state.deleteWorkgroup.id).then(() => {
                              this.resetWorkgroup(
                                {
                                  deleteWorkgroup: null,
                                },
                                () => {
                                  this.listWorkgroups(true);
                                },
                              );
                            });
                          }}>
                          <span
                            style={{
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                            }}>
                            {t("deleteForever")}
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  </Modal.Actions>
                </Modal>
                <Table celled compact selectable size="small">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        style={{
                          whiteSpace: "nowrap",
                        }}>
                        {t("workgroup")}
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        style={{
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}>
                        {t("boreholes")}
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        style={{
                          textTransform: "capitalize",
                          whiteSpace: "nowrap",
                        }}>
                        {t("roles")}
                      </Table.HeaderCell>
                      <Table.HeaderCell />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body data-cy="workgroup-list-table-body">
                    {this.state.workgroups?.map(workgroup => {
                      const showWorkgroup =
                        (this.state.workgroupsSearch !== "" &&
                          workgroup.name.toUpperCase().includes(this.state.workgroupsSearch.toUpperCase())) ||
                        (this.state.workgroupsSearch === "" &&
                          (this.state.workgroupFilter === "all" ||
                            (this.state.workgroupFilter === "disabled" && workgroup.disabledAt !== null) ||
                            (this.state.workgroupFilter === "enabled" && workgroup.disabledAt === null)));
                      return (
                        showWorkgroup && (
                          <Table.Row
                            active={this.state.wId === workgroup.id}
                            key={"stng-workgroups-" + workgroup.id}
                            onClick={() => {
                              if (this.state.wId === workgroup.id) {
                                this.resetWorkgroup();
                              } else {
                                this.setState({
                                  wId: workgroup.id,
                                  wName: workgroup.name,
                                  wDisabled: workgroup.disabledAt,
                                  workgroup: workgroup,
                                });
                              }
                            }}>
                            <Table.Cell>
                              {workgroup.disabledAt !== null ? (
                                <Label
                                  circular
                                  color={"red"}
                                  empty
                                  style={{
                                    marginRight: "1em",
                                  }}
                                />
                              ) : null}
                              {workgroup.name}
                            </Table.Cell>
                            <Table.Cell>{workgroup.boreholeCount}</Table.Cell>
                            <Table.Cell
                              style={{
                                paddingTop: "20px",
                              }}>
                              <WorkgroupRoleSettings
                                user={this.state.user}
                                workgroup={workgroup}
                                setRole={this.setRole.bind(this)}
                              />
                              {workgroup.disabledAt !== null ? (
                                <span
                                  style={{
                                    color: "#787878",
                                    fontStyle: "italic",
                                    marginLeft: "0.5em",
                                  }}>
                                  {t("disabled")}
                                  &nbsp;
                                  <DateText date={workgroup.disabledAt} fromnow />
                                  &nbsp;(
                                  <DateText date={workgroup.disabledAt} hours />)
                                </span>
                              ) : null}
                            </Table.Cell>
                            <Table.Cell>
                              <span
                                className="linker link"
                                onClick={e => {
                                  e.stopPropagation();
                                  this.setState({
                                    deleteWorkgroup: workgroup,
                                  });
                                }}>
                                {workgroup.disabledAt !== null ? t("enableWorkgroup") : t("disableWorkgroup")}
                              </span>
                            </Table.Cell>
                          </Table.Row>
                        )
                      );
                    })}
                  </Table.Body>
                </Table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

AdminSettings.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
  users: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    user: state.core_user,
    workgroups: state.core_workgroups,
  };
};

const ConnectedAdminSettings = connect(mapStateToProps)(withTranslation(["common"])(AdminSettings));
export default ConnectedAdminSettings;
