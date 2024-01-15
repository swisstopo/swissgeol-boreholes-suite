import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { withAuth } from "react-oidc-context";
import Markdown from "markdown-to-jsx";
import TranslationKeys from "../../commons/translationKeys";

import { Button } from "semantic-ui-react";

import {
  loadDomains,
  loadBoreholes,
  loadSettings,
  loadUser,
  getContent,
} from "../../api-lib/index";

class DataLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      title: {
        en: "",
        de: "",
        fr: "",
        it: "",
        ro: "",
      },
      body: {
        en: "",
        de: "",
        fr: "",
        it: "",
        ro: "",
      },
    };
  }

  componentDidMount() {
    getContent("login").then(r => {
      if (r.data.data !== null) {
        this.setState({
          isFetching: false,
          title: r.data.data.title,
          body: r.data.data.body,
        });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.user?.authentication && this.props.user?.authentication) {
      this.props.loadUser();
      this.props.loadSettings();
      this.props.loadDomains();
      this.props.loadBoreholeCount();
    }
  }

  render() {
    const isLoading =
      this.props.auth?.isLoading || this.props.user?.authentication;
    return (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#787878",
          display: "flex",
          flex: "1 1 0%",
          justifyContent: "center",
          height: "100%",
        }}>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            display: "flex",
            flexDirection: "column",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              padding: "2em",
            }}>
            <div
              style={{
                width: "300px",
                paddingRight: "1em",
              }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}>
                <img
                  alt="Swiss Logo"
                  src={process.env.PUBLIC_URL + "/logo.svg"}
                  style={{
                    height: "70px",
                  }}
                />
                <div
                  style={{
                    marginLeft: "1em",
                    textAlign: "left",
                  }}>
                  <div>
                    <div
                      style={{
                        fontSize: "1.2em",
                      }}>
                      {this.state.title[this.props.i18n.language]}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8em",
                      }}>
                      Borehole Data Management System
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: "2em",
                }}>
                {this.state.body.hasOwnProperty(this.props.i18n.language) ? (
                  <Markdown>
                    {this.state.body[this.props.i18n.language]}
                  </Markdown>
                ) : null}
              </div>
            </div>
            <div
              style={{
                width: "300px",
                padding: "0px 1em 0px 2em",
              }}>
              <div
                style={{
                  fontSize: "1.2em",
                  paddingBottom: "2em",
                  textAlign: "center",
                }}>
                Sign in
              </div>
              {isLoading ? (
                <Button
                  disabled
                  color={"green"}
                  compact
                  loading
                  content="Login"
                  fluid
                  size="small"
                  style={{
                    marginTop: "1.5em",
                  }}
                />
              ) : (
                <Button
                  compact
                  primary
                  content="Login"
                  fluid
                  onClick={() => {
                    this.props.auth.signinRedirect();
                  }}
                  size="small"
                  style={{
                    marginTop: "1.5em",
                  }}
                  data-cy="login-button"
                />
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "10px",
            }}>
            <TranslationKeys />
          </div>
        </div>
      </div>
    );
  }
}

DataLoader.propTypes = {
  i18n: PropTypes.object,
  loadDomains: PropTypes.func,
  loadBoreholeCount: PropTypes.func,
  loadSettings: PropTypes.func,
  loadUser: PropTypes.func,
  user: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    loadDomains: () => {
      dispatch(loadDomains());
    },
    loadBoreholeCount: () => {
      // Only load one borehole to get the total borehole count.
      // We need the count in case of the map only appearance, otherwise the boreholes get loaded by the borehole table.
      dispatch(loadBoreholes(1, 1));
    },
    loadSettings: () => {
      dispatch(loadSettings());
    },
    loadUser: () => {
      dispatch(loadUser());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuth(withTranslation("common")(DataLoader)));
