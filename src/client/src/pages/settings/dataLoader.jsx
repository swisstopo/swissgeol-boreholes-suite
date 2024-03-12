import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { withAuth } from "react-oidc-context";
import Markdown from "markdown-to-jsx";
import TranslationKeys from "../../commons/translationKeys";
import { styled } from "@mui/material/styles";
import { Button } from "semantic-ui-react";
import Alert from "@mui/material/Alert";
import LoginDialog from "../../commons/form/loginDialog";

import { loadDomains, loadBoreholes, loadSettings, loadUser, getContent } from "../../api-lib/index";

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
    const { t } = this.props;
    const isLoading = !this.props.auth || this.props.auth.isLoading || this.props.user?.authentication;

    const authorizationFailed = this.props.user?.authentication && this.props.user.error;

    const OuterContainer = styled("div")({
      alignItems: "center",
      backgroundColor: "#787878",
      display: "flex",
      flex: "1 1 0%",
      justifyContent: "center",
      height: "100%",
    });

    const InnerContainer = styled("div")({
      backgroundColor: "#fff",
      borderRadius: "2px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      display: "flex",
      flexDirection: "column",
      minWidth: "100px",
      maxWidth: "600px",
    });

    const RowContainer = styled("div")({
      display: "flex",
      flexDirection: "row",
      padding: "2em",
    });

    const MarkdownContainer = styled("div")({
      paddingTop: "2em",
      marginBottom: "1em",
    });

    const CommonButtonStyle = { marginTop: "1.5em", width: "120px", alignSelf: "center" };

    return (
      <OuterContainer>
        <InnerContainer>
          <RowContainer>
            <LoginDialog title={this.state.title[this.props.i18n.language]}>
              <MarkdownContainer>
                {this.state.body[this.props.i18n.language] && (
                  <Markdown>{this.state.body[this.props.i18n.language]}</Markdown>
                )}
              </MarkdownContainer>
              {!(isLoading || authorizationFailed) ? (
                <Button
                  compact
                  primary
                  content="Login"
                  fluid
                  onClick={() => {
                    this.props.auth.signinRedirect({
                      url_state: btoa(JSON.stringify({ href: window.location.href })),
                    });
                  }}
                  size="small"
                  style={CommonButtonStyle}
                  data-cy="login-button"
                />
              ) : null}
              {isLoading && !authorizationFailed ? (
                <Button
                  disabled
                  color={"green"}
                  compact
                  loading
                  content="Login"
                  fluid
                  size="small"
                  style={CommonButtonStyle}
                />
              ) : null}
              {authorizationFailed ? (
                <>
                  <Alert severity="error">{t("userUnauthorized")}</Alert>
                  <Button
                    compact
                    fluid
                    color="red"
                    content="Logout"
                    onClick={() => this.props.auth.signoutRedirect()}
                    style={CommonButtonStyle}
                  />
                </>
              ) : null}
            </LoginDialog>
          </RowContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "10px",
            }}>
            <TranslationKeys />
          </div>
        </InnerContainer>
      </OuterContainer>
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

const DataLoaderConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuth(withTranslation("common")(DataLoader)));
export default DataLoaderConnected;
