import React from "react";
import { connect } from "react-redux";
import { withAuth } from "react-oidc-context";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import { List, Icon, Popup } from "semantic-ui-react";

import TranslationText from "../form/translationText";
import TranslationKeys from "../translationKeys";
class MenuComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handleModeChange } = this.props;
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
          alt="Swiss Logo"
          src={"/swissgeol_boreholes.svg"}
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
        </div>
        <div
          style={{
            flex: "1 1 100%",
          }}
        />

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
                    handleModeChange("setting/editor");
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

const ConnectedMenuComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuth(withTranslation(["common"])(MenuComponent)));
export default ConnectedMenuComponent;
