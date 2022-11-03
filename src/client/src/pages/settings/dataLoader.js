import React, { createRef } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";
import TranslationKeys from "../../commons/translationKeys";

import { Button, Input } from "semantic-ui-react";

import {
  loadDomains,
  loadCantons,
  loadSettings,
  loadUser,
  setAuthentication,
  getContent,
} from "../../api-lib/index";

class DataLoader extends React.Component {
  constructor(props) {
    super(props);
    this.fieldToRef = createRef();
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
    if (process.env.NODE_ENV === "development") {
      this.props.setAuthentication("admin", "swissforages");
    } else {
      this.props.setAuthentication("", "");
    }
    this.fieldToRef.current.focus();

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
    // console.log(this.props.i18n.language, this.props.i18n);
    if (!_.isEqual(this.props.user.data, prevProps.user.data)) {
      this.props.loadSettings();
      this.props.loadDomains();
      this.props.loadCantons();
    }
  }

  render() {
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
              {/* <div
                style={{
                  paddingTop: '1em'
                }}
              >
                For any use of swissforages.ch please respect the disclaimer of
                the Swiss Confederation and in particular the disclaimer
                (LINK to DISCLAIMER) of swissforages.ch.
              </div> */}
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
              {/** Trick to disable autofill in chrome */}
              <input
                name="password"
                style={{
                  display: "none",
                }}
                type="password"
              />
              <div
                style={{
                  fontSize: "0.8em",
                  paddingBottom: "4px",
                }}>
                Username
              </div>
              <Input
                autoComplete="off"
                fluid
                onChange={e => {
                  this.props.setAuthentication(
                    e.target.value,
                    this.props.user.authentication !== null
                      ? this.props.user.authentication.password
                      : "",
                  );
                }}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    this.props.loadUser();
                  }
                }}
                placeholder="username"
                ref={this.fieldToRef}
                value={
                  this.props.user.authentication !== null
                    ? this.props.user.authentication.username
                    : ""
                }
              />

              <div
                style={{
                  fontSize: "0.8em",
                  padding: "8px 0px 4px 0px",
                }}>
                Password
              </div>
              <Input
                autoComplete="off"
                fluid
                onChange={e => {
                  this.props.setAuthentication(
                    this.props.user.authentication !== null
                      ? this.props.user.authentication.username
                      : "",
                    e.target.value,
                  );
                }}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    this.props.loadUser();
                  }
                }}
                placeholder="password"
                type="password"
                value={
                  this.props.user.authentication !== null
                    ? this.props.user.authentication.password
                    : ""
                }
              />
              <Button
                color={this.props.user.data !== null ? "green" : null}
                compact
                content="Login"
                fluid
                loading={this.props.user.data !== null}
                onClick={() => {
                  this.props.loadUser();
                }}
                primary={this.props.user.data === null}
                size="small"
                style={{
                  marginTop: "1.5em",
                }}
              />
              <div
                style={{
                  color: "red",
                  fontSize: "0.8em",
                }}>
                {this.props.user.error === false ? (
                  <span>&nbsp;</span>
                ) : (
                  "User or password wrong"
                )}
              </div>
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
  anonymousLogin: PropTypes.func,
  i18n: PropTypes.object,
  loadCantons: PropTypes.func,
  loadDomains: PropTypes.func,
  loadSettings: PropTypes.func,
  loadUser: PropTypes.func,
  setAuthentication: PropTypes.func,
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
    loadCantons: () => {
      dispatch(loadCantons());
    },
    loadSettings: () => {
      dispatch(loadSettings());
    },
    loadUser: () => {
      dispatch(loadUser());
    },
    setAuthentication: (username, password) => {
      return dispatch(setAuthentication(username, password));
    },
    anonymousLogin: async (username, password) => {
      await Promise.all([
        dispatch(setAuthentication(username, password)),
        dispatch(loadUser()),
      ]);
      return "ciao";
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(DataLoader));
