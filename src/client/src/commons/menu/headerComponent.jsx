import { connect } from "react-redux";
import { withAuth } from "react-oidc-context";
import { withTranslation } from "react-i18next";
import { List, Icon, Popup } from "semantic-ui-react";
import TranslationText from "../form/translationText";
import TranslationKeys from "../translationKeys";
import { theme } from "../../AppTheme";

const HeaderComponent = ({ user, auth }) => {
  const baseUrl = window.location.host;

  return (
    <div
      style={{
        alignItems: "center",
        boxShadow: theme.palette.boxShadow + " 0px 4px 12px",
        display: "flex",
        flexDirection: "row",
        height: "5em",
        padding: "0px 1em",
        zIndex: "10",
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
          {user.data !== null ? (
            <div
              style={{
                padding: "0.5em",
              }}>
              <div>{user.data.name}</div>
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
                  {user.data.username}
                </div>
                <div>
                  <span
                    className="link linker"
                    onClick={() => {
                      auth.signoutRedirect();
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
};

const mapStateToProps = state => {
  return {
    checkout: state.checkout,
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
)(withAuth(withTranslation(["common"])(HeaderComponent)));

export default ConnectedMenuComponent;
