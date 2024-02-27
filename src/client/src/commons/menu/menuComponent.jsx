import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withAuth } from "react-oidc-context";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import { List, Icon, Popup } from "semantic-ui-react";

import Feedback from "../feedback/feedbackComponent";
import TranslationText from "../form/translationText";
import TranslationKeys from "../translationKeys";
class MenuComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      feedback: false,
    };
  }

  render() {
    const { handleModeChange, mode } = this.props;
    const baseUrl = window.location.host;

    return (
      <div
        style={{
          alignItems: "center",
          boxShadow: "rgba(0, 0, 0, 0.17) 0px 4px 12px",
          display: "flex",
          flexDirection: "row",
          height: "5em",
          padding: "0px 1em",
          zIndex: 10,
        }}>
        <img
          alt="ch logo"
          src={"/logo.svg"}
          style={{
            height: "45px",
            width: "auto",
          }}
        />
        <div
          style={{
            marginLeft: "1em",
          }}>
          <div
            data-cy="app-title"
            style={{
              fontSize: "1.2em",
              fontWeight: "bold",
            }}>
            {baseUrl}
          </div>
          <div
            style={{
              color: "#787878",
              fontSize: "0.8em",
            }}>
            {(() => {
              switch (mode) {
                case "viewer":
                  return (
                    <span style={{ color: "#ed1d24" }}>
                      <Icon name="binoculars" /> Viewer
                    </span>
                  );
                case "editor":
                  return (
                    <span style={{ color: "#ed1d24" }}>
                      <Icon name="edit" /> Editor
                    </span>
                  );
                case "setting":
                  return (
                    <span style={{ color: "#ed1d24" }}>
                      <Icon name="setting" /> Settings
                    </span>
                  );

                default:
                  break;
              }
            })()}
          </div>
        </div>
        <div
          style={{
            flex: "1 1 100%",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1em",
            textAlign: "right",
          }}>
          <Popup
            content={
              <Feedback
                onFinised={() => {
                  this.setState({
                    feedback: false,
                  });
                }}
              />
            }
            on="click"
            onClose={() => {
              this.setState({
                feedback: false,
              });
            }}
            onOpen={() => {
              this.setState({
                feedback: true,
              });
            }}
            open={this.state.feedback}
            position="top right"
            trigger={<div className="linker">Feedback</div>}
          />
        </div>
        <Popup
          on="click"
          position="bottom right"
          trigger={
            <Icon
              name="th"
              size="big"
              data-cy="menu"
              style={{
                cursor: "pointer",
              }}
            />
          }>
          <div
            style={{
              minWidth: "200px",
            }}>
            {this.props.user.data !== null ? (
              <div
                style={{
                  padding: "0.5em",
                }}>
                <div>{this.props.user.data.name}</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    fontSize: "0.8em",
                  }}>
                  <div
                    style={{
                      color: "#787878",
                      flex: "1 1 100%",
                    }}>
                    {this.props.user.data.username}
                  </div>
                  <div>
                    <span
                      className="link linker"
                      onClick={() => {
                        this.props.auth.signoutRedirect();
                        if (_.isFunction(handleModeChange)) {
                          handleModeChange("viewer");
                        }
                      }}>
                      Logout
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            <List
              divided
              relaxed
              selection
              style={{
                marginTop: "0px",
              }}>
              <List.Item
                onClick={() => {
                  if (_.isFunction(handleModeChange)) {
                    handleModeChange("viewer");
                  }
                }}
                style={{
                  padding: "0.5em",
                }}>
                <List.Icon name="binoculars" verticalAlign="middle" />
                <List.Content>
                  <List.Header as="h4">Viewer</List.Header>
                  <List.Description>
                    <TranslationText id="header_viewerdesc" />
                  </List.Description>
                </List.Content>
              </List.Item>
              {this.props.user.data !== null &&
              (this.props.user.data.roles.indexOf("VIEW") >= 0 ||
                this.props.user.data.roles.indexOf("EDIT") >= 0 ||
                this.props.user.data.roles.indexOf("CONTROL") >= 0 ||
                this.props.user.data.roles.indexOf("VALID") >= 0 ||
                this.props.user.data.roles.indexOf("PUBLIC") >= 0) ? (
                <List.Item
                  onClick={() => {
                    if (_.isFunction(handleModeChange)) {
                      handleModeChange("editor");
                    }
                  }}
                  style={{
                    padding: "0.5em",
                  }}
                  data-cy="editor-list-item">
                  <List.Icon name="edit" verticalAlign="middle" />
                  <List.Content>
                    <List.Header as="h4">Editor</List.Header>
                    <List.Description>
                      <TranslationText id="header_editordesc" />
                    </List.Description>
                  </List.Content>
                </List.Item>
              ) : null}
              <List.Item
                onClick={() => {
                  if (_.isFunction(handleModeChange)) {
                    handleModeChange("setting/explorer");
                  }
                }}
                style={{
                  padding: "0.5em",
                }}
                data-cy="settings-list-item">
                <List.Icon name="cog" verticalAlign="middle" />
                <List.Content>
                  <List.Header as="h4">
                    <TranslationText id="header_settings" />
                  </List.Header>
                  <List.Description>
                    <TranslationText id="header_settingdesc" />
                  </List.Description>
                </List.Content>
              </List.Item>
              <List.Item
                onClick={() => window.open(`/help`)}
                style={{
                  padding: "0.5em",
                }}>
                <List.Icon name="question circle" verticalAlign="middle" />
                <List.Content>
                  <List.Header as="h4">
                    <TranslationText id="header_help" />
                  </List.Header>
                </List.Content>
              </List.Item>
              {this.props.user.data.admin === true ? (
                <List.Item
                  onClick={() => {
                    this.props.dispatch({
                      type: "DEBUG_SWITCH",
                    });
                  }}
                  style={{
                    padding: "0.5em",
                  }}>
                  <List.Icon name="edit" verticalAlign="middle" />
                  <List.Content>
                    <List.Header as="h4">Debug</List.Header>
                    <List.Description>
                      {this.props.developer.debug === true ? (
                        <TranslationText id="enabled" />
                      ) : (
                        <TranslationText id="disabled" />
                      )}
                    </List.Description>
                  </List.Content>
                </List.Item>
              ) : null}
              <List.Item>
                <List.Content
                  style={{
                    fontSize: "smaller",
                  }}>
                  <List.Description>
                    <TranslationText id="version" />
                    :&nbsp;
                    {import.meta.env.VITE_APP_VERSION}
                  </List.Description>
                  {import.meta.env.NODE_ENV !== "production" && (
                    <List.Description
                      style={{
                        color: "darkred",
                      }}>
                      <TranslationText id="header_environment_identifier" />
                      :&nbsp;
                      {import.meta.env.NODE_ENV}
                    </List.Description>
                  )}
                </List.Content>
              </List.Item>
            </List>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}>
              <TranslationKeys />
            </div>
          </div>
        </Popup>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    checkout: state.checkout,
    developer: state.developer,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
  };
};

MenuComponent.propTypes = {
  handleModeChange: PropTypes.func,
  mode: PropTypes.string,
  user: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuth(withTranslation(["common"])(MenuComponent)));
