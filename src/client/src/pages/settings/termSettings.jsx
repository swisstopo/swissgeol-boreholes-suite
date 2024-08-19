import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";
import { Button, Form, Modal, TextArea } from "semantic-ui-react";

import TranslationKeys from "../../auth/translationKeys";

import { draftTerms, getTermsDraft, publishTerms } from "../../api-lib/index";

class TermSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      publishing: false,
      confirmPublication: false,
      dirty: false,
      draft: false,
      id: null,
      en: "",
      de: "",
      fr: "",
      it: "",
      ro: "",
      lang: props.i18n.language,
    };
    this.changeLanguage = this.changeLanguage.bind(this);
    this.draftTerms = this.draftTerms.bind(this);
    this.publishTerms = this.publishTerms.bind(this);
  }

  changeLanguage(lang) {
    this.setState({
      lang: lang,
    });
  }
  componentDidMount() {
    getTermsDraft(true).then(r => {
      if (r.data.data !== null) {
        this.setState({
          isFetching: false,
          id: r.data.data.id,
          draft: r.data.data.draft,
          en: r.data.data.en,
          fr: r.data.data.fr,
          de: r.data.data.de,
          it: r.data.data.it,
          ro: r.data.data.ro,
        });
      }
    });
  }

  draftTerms() {
    this.setState(
      {
        saving: true,
      },
      () => {
        draftTerms({
          en: this.state.en,
          de: this.state.de,
          fr: this.state.fr,
          it: this.state.it,
          ro: this.state.ro,
        }).then(() => {
          this.setState({
            dirty: false,
            draft: true,
            saving: false,
          });
        });
      },
    );
  }

  publishTerms() {
    publishTerms().then(() => {
      this.setState({
        draft: false,
        dirty: false,
        confirmPublication: false,
      });
    });
  }

  render() {
    const { t } = this.props;
    // const {
    //   i18n
    // } = this.props;
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
            padding: "1em",
            margin: "1em",
          }}>
          <div
            style={{
              // alignItems: 'center',
              display: "flex",
              flexDirection: "row",
              paddingBottom: "1em",
            }}>
            <div
              style={{
                color: "rgb(237, 29, 36)",
                fontStyle: "italic",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}>
              {this.state.draft === true ? t("draft") : t("terms")}
            </div>
            <div
              style={{
                flex: "1 1 100%",
                textAlign: "right",
              }}>
              <Button
                onClick={() => {
                  this.setState({
                    confirmPublication: true,
                  });
                }}
                primary
                style={{
                  display: this.state.draft === true && this.state.dirty === false ? null : "none",
                  textTransform: "capitalize",
                }}>
                {t("publish")}
              </Button>
              <Modal open={this.state.confirmPublication} size="mini">
                <Modal.Header>{t("disclaimer_publish_title")}</Modal.Header>
                <Modal.Content>
                  <p>{t("disclaimer_publish_message")}</p>
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    negative
                    onClick={() => {
                      this.setState({
                        confirmPublication: false,
                      });
                    }}
                    style={{
                      textTransform: "capitalize",
                    }}>
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={() => this.publishTerms()}
                    primary
                    style={{
                      textTransform: "capitalize",
                    }}>
                    {t("publish")}
                  </Button>
                </Modal.Actions>
              </Modal>
              <Button
                disabled={this.state.dirty === false}
                loading={this.state.saving}
                onClick={() => {
                  this.draftTerms();
                }}
                secondary
                style={{
                  marginLeft: "1em",
                  textTransform: "capitalize",
                  display: this.state.dirty === true ? null : "none",
                }}>
                {t("save")}
              </Button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "10px",
            }}>
            <TranslationKeys ignori18n handleSelectedLanguage={this.changeLanguage} />
          </div>

          <Form>
            <TextArea
              onChange={e => {
                let text = {
                  dirty: true,
                };
                text[this.state.lang] = e.target.value;
                this.setState(text);
              }}
              rows={20}
              value={this.state[this.state.lang]}
            />
          </Form>
        </div>
        <div
          style={{
            flex: "1 1 100%",
            padding: "1em",
            margin: "1em",
          }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              paddingBottom: "1em",
            }}>
            <div
              style={{
                color: "rgb(237, 29, 36)",
                fontStyle: "italic",
                textTransform: "capitalize",
              }}>
              {t("preview")}
            </div>
          </div>
          <Markdown>{this.state[this.state.lang]}</Markdown>
        </div>
      </div>
    );
  }
}

TermSettings.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
};

// TermSettings.defaultProps = {
// };

const mapStateToProps = state => {
  return {
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
  };
};

const ConnectedTermSettings = connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(TermSettings));
export default ConnectedTermSettings;
