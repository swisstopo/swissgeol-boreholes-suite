import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { acceptTerms, getTerms } from "../../api-lib";
import { theme } from "../../AppTheme";

import Markdown from "markdown-to-jsx";
import TranslationKeys from "../auth/translationKeys";

class AcceptTerms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAccepting: false,
      isFetching: true,
      id: null,
      en: "",
      de: "",
      fr: "",
      it: "",
      ro: "",
    };
  }

  componentDidMount() {
    getTerms().then(r => {
      if (r.data.data) {
        this.setState({
          isFetching: false,
          id: r.data.data.id,
          en: r.data.data.en,
          fr: r.data.data.fr,
          de: r.data.data.de,
          it: r.data.data.it,
          ro: r.data.data.ro,
        });
      }
    });
  }

  render() {
    return this.props.loader.terms ? (
      this.props.children
    ) : (
      <div
        style={{
          alignItems: "center",
          backgroundColor: theme.palette.background.darkgrey,
          display: "flex",
          flex: "1 1 0%",
          // flexDirection: 'column',
          justifyContent: "center",
          height: "100%",
        }}>
        <div
          style={{
            backgroundColor: theme.palette.background.default,
            borderRadius: "2px",
            boxShadow: "0 1px 3px " + theme.palette.boxShadow + ", 0 1px 2px " + theme.palette.boxShadow,
            display: "flex",
            // flex: '1 1 100%',
            flexDirection: "column",
            margin: "1em 0px",
            height: "60%",
            overflowY: "hidden",
            width: "600px",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "10px",
            }}>
            <TranslationKeys />
          </div>

          <div
            style={{
              flex: "1 1 100%",
              overflowY: "auto",
              paddingRight: "2em",
              margin: "0px 0px 0px 2em",
            }}>
            <Markdown
              style={{
                marginBottom: "1em",
              }}>
              {this.state[this.props.i18n.language]}
            </Markdown>
          </div>
          <div
            style={{
              alignItems: "center",
              borderTop: "thin solid #787878",
              padding: "1em",
              display: "flex",
              flexDirection: "row",
            }}>
            {/* <Button
              secondary
              style={{
                whiteSpace: 'nowrap'
              }}
            >
              I disagree
            </Button> */}
            <div
              style={{
                flex: "1 1 100%",
              }}
            />
            <Button
              loading={this.state.isAccepting}
              onClick={() => {
                this.setState(
                  {
                    isAccepting: true,
                  },
                  () => {
                    this.props.acceptTerms(this.state.id);
                  },
                );
              }}
              primary
              style={{
                whiteSpace: "nowrap",
              }}>
              {this.props.t("iagree")}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

AcceptTerms.propTypes = {
  acceptTerms: PropTypes.func,
  // i18n: PropTypes.shape({
  //   changeLanguage: PropTypes.func,
  //   language: PropTypes.text
  // }),
  t: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    user: state.core_user,
    loader: state.dataLoaderState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    acceptTerms: async id => {
      return dispatch(acceptTerms(id));
    },
  };
};

const ConnectedAcceptTerms = connect(mapStateToProps, mapDispatchToProps)(withTranslation("common")(AcceptTerms));
export default ConnectedAcceptTerms;
