import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Button, Form, Modal, TextArea } from "semantic-ui-react";

import Login from "../../commons/form/login";
import TranslationKeys from "../../commons/translationKeys";

import {
  draftContent,
  getContentDraft,
  publishContent,
} from "../../lib/index";

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      publishing: false,
      confirmPublication: false,
      dirty: false,
      draft: false,
      id: null,
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
      lang: props.i18n.language,
    };
    this.changeLanguage = this.changeLanguage.bind(this);
    this.draftContent = this.draftContent.bind(this);
    this.publishContent = this.publishContent.bind(this);
  }

  changeLanguage(lang) {
    this.setState({
      lang: lang,
    });
  }

  componentDidMount() {
    getContentDraft("login").then((r) => {
      if (r.data.data !== null) {
        this.setState({
          isFetching: false,
          id: r.data.data.id,
          draft: r.data.data.draft,
          title: r.data.data.title,
          body: r.data.data.body,
        });
      }
    });
  }

  draftContent() {
    this.setState(
      {
        saving: true,
      },
      () => {
        draftContent("login", {
          body: this.state.body,
          title: this.state.title,
        }).then((r) => {
          if (r.data.success === true) {
            this.setState({
              dirty: false,
              draft: true,
              saving: false,
            });
          } else {
            alert(r.data.message);
            this.setState({
              saving: false,
            });
          }
        });
      }
    );
  }

  publishContent() {
    publishContent("login").then((r) => {
      if (r.data.success === true) {
        this.setState({
          draft: false,
          dirty: false,
          confirmPublication: false,
        });
      } else {
        alert(r.data.message);
      }
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
        }}
      >
        <div
          style={{
            flex: "1 1 60%",
            padding: "1em",
            margin: "1em",
          }}
        >
          <div
            style={{
              // alignItems: 'center',
              display: "flex",
              flexDirection: "row",
              paddingBottom: "1em",
            }}
          >
            <div
              style={{
                color: "rgb(237, 29, 36)",
                fontStyle: "italic",
                whiteSpace: "nowrap",
              }}
            >
              {this.state.draft === true ? t("draft") : t("loginScreen")}
            </div>
            <div
              style={{
                flex: "1 1 100%",
                textAlign: "right",
              }}
            >
              <Button
                onClick={() => {
                  this.setState({
                    confirmPublication: true,
                  });
                }}
                primary
                style={{
                  display:
                    this.state.draft === true && this.state.dirty === false
                      ? null
                      : "none",
                  textTransform: "capitalize",
                }}
              >
                {t("publish")}
              </Button>
              <Modal open={this.state.confirmPublication} size="mini">
                <Modal.Header>
                  {t("messages:content_publish_title")}
                </Modal.Header>
                <Modal.Content>
                  <p>{t("messages:content_publish_message")}</p>
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
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={() => this.publishContent()}
                    primary
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {t("publish")}
                  </Button>
                </Modal.Actions>
              </Modal>
              <Button
                disabled={this.state.dirty === false}
                loading={this.state.saving}
                onClick={() => {
                  this.draftContent();
                }}
                secondary
                style={{
                  marginLeft: "1em",
                  textTransform: "capitalize",
                  display: this.state.dirty === true ? null : "none",
                }}
              >
                {t("save")}
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <TranslationKeys
              ignori18n
              handleSelectedLanguage={this.changeLanguage}
            />
          </div>

          <Form>
            <Form.Input
              label="Title"
              onChange={(e, data) => {
                this.setState({
                  dirty: true,
                  title: {
                    ...this.state.title,
                    [this.state.lang]: e.target.value,
                  },
                });
              }}
              type="text"
              value={this.state.title[this.state.lang]}
            />
            <TextArea
              onChange={(e, data) => {
                this.setState({
                  dirty: true,
                  body: {
                    ...this.state.body,
                    [this.state.lang]: e.target.value,
                  },
                });
              }}
              rows={20}
              value={this.state.body[this.state.lang]}
            />
          </Form>
        </div>
        <div
          style={{
            flex: "1 1 100%",
            padding: "1em",
            margin: "1em",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              paddingBottom: "1em",
            }}
          >
            <div
              style={{
                color: "rgb(237, 29, 36)",
                fontStyle: "italic",
                textTransform: "capitalize",
              }}
            >
              {t("preview")}
            </div>
          </div>
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#787878",
              display: "flex",
              flex: "1 1 100%",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                transform: "scale(0.80)",
              }}
            >
              <Login
                body={this.state.body[this.state.lang]}
                title={this.state.title[this.state.lang]}
                user={{
                  data: null,
                  authentication: {
                    password: "",
                    username: "",
                  },
                  error: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LoginScreen.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
};

// LoginScreen.defaultProps = {
// };

const mapStateToProps = (state) => {
  return {
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation(["common", "messages"])(LoginScreen));
