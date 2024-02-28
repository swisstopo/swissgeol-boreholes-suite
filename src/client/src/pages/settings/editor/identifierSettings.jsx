import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { AlertContext } from "../../../components/alert/alertContext";

import { Button, Icon, Form, Modal, Header } from "semantic-ui-react";

import { listIdentifier, createIdentifier, deleteIdentifier, updateIdentifier } from "../../../api-lib/index";
import TranslationText from "../../../commons/form/translationText";

class IdentifierSettings extends React.Component {
  static contextType = AlertContext;
  constructor(props) {
    super(props);
    this.state = {
      isOpenConfirmDelete: false,
      id: "",
      de: "",
      fr: "",
      it: "",
      en: "",
    };
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    this.props.listIdentifier();
  }

  reset() {
    this.setState({
      id: "",
      de: "",
      fr: "",
      it: "",
      en: "",
    });
  }

  handleOpenConfirmDelete = () => {
    this.setState({ isOpenConfirmDelete: true });
  };

  handleCloseConfirmDelete = () => {
    this.setState({ isOpenConfirmDelete: false });
  };

  render() {
    const { t, domains } = this.props;
    return (
      <div
        style={{
          padding: "2em",
        }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
          }}>
          <Form
            style={{
              flex: 1,
            }}>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label={<TranslationText id="german" />}
                onChange={e => {
                  this.setState({
                    de: e.target.value,
                  });
                }}
                placeholder={t("borehole_identifier")}
                value={this.state.de}
              />
              <Form.Input
                fluid
                label={<TranslationText id="french" />}
                onChange={e => {
                  this.setState({
                    fr: e.target.value,
                  });
                }}
                placeholder={t("borehole_identifier")}
                value={this.state.fr}
              />
              <Form.Input
                fluid
                label={<TranslationText id="italian" />}
                onChange={e => {
                  this.setState({
                    it: e.target.value,
                  });
                }}
                placeholder={t("borehole_identifier")}
                value={this.state.it}
              />
              <Form.Input
                fluid
                label={<TranslationText id="english" />}
                onChange={e => {
                  this.setState({
                    en: e.target.value,
                  });
                }}
                placeholder={t("borehole_identifier")}
                value={this.state.en}
              />
              <div
                style={{
                  flex: "0 0 0% !important",
                }}>
                <Form.Button
                  icon
                  label="&nbsp;"
                  onClick={e => {
                    e.stopPropagation();
                    if (this.state.id !== null && this.state.id !== "") {
                      updateIdentifier(this.state.id, {
                        de: this.state.de,
                        fr: this.state.fr,
                        it: this.state.it,
                        en: this.state.en,
                      }).then(() => {
                        this.props.listIdentifier();
                      });
                    } else {
                      createIdentifier({
                        de: this.state.de,
                        fr: this.state.fr,
                        it: this.state.it,
                        en: this.state.en,
                      }).then(() => {
                        this.reset();
                        this.props.listIdentifier();
                      });
                    }
                  }}>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                    }}>
                    {this.state.id !== null && this.state.id !== "" ? <Icon name="save" /> : <Icon name="plus" />}{" "}
                    {this.state.id !== null && this.state.id !== "" ? (
                      <TranslationText id="save" />
                    ) : (
                      <TranslationText id="add" />
                    )}
                  </span>
                </Form.Button>

                <div className="linker link" onClick={() => this.reset()}>
                  <TranslationText id="reset" />
                </div>
              </div>
            </Form.Group>
          </Form>
        </div>
        <hr />
        <div>
          {Object.prototype.hasOwnProperty.call(domains.data, "borehole_identifier") &&
          domains.data["borehole_identifier"].length > 0
            ? domains.data["borehole_identifier"].map((val, idx) => (
                <div
                  className="selectable"
                  key={"bisp-" + idx}
                  onClick={() => {
                    if (this.state.id === val.id) {
                      this.reset();
                    } else {
                      this.setState({
                        id: val.id,
                        de: val.de.text,
                        fr: val.fr.text,
                        it: val.it.text,
                        en: val.en.text,
                      });
                    }
                  }}
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flex: 1,
                    flexDirection: "row",
                    paddingBottom: "0.5em",
                    backgroundColor: this.state.id === val.id ? "#595959" : null,
                    color: this.state.id === val.id ? "white" : null,
                  }}>
                  <div
                    style={{
                      marginLeft: "1em",
                      flex: "1 1 100%",
                    }}>
                    {val.de.text}
                  </div>
                  <div
                    style={{
                      marginLeft: "1em",
                      flex: "1 1 100%",
                    }}>
                    {val.fr.text}
                  </div>
                  <div
                    style={{
                      marginLeft: "1em",
                      flex: "1 1 100%",
                    }}>
                    {val.it.text}
                  </div>
                  <div
                    style={{
                      marginLeft: "1em",
                      flex: "1 1 100%",
                    }}>
                    {val.en.text}
                  </div>
                  <Button
                    color="red"
                    icon
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({
                        id: val.id,
                        isOpenConfirmDelete: true,
                        de: val.de.text,
                        fr: val.fr.text,
                        it: val.it.text,
                        en: val.de.text,
                      });
                    }}
                    size="tiny">
                    <Icon name="trash alternate outline" />
                  </Button>
                </div>
              ))
            : "Empty"}
        </div>
        <Modal closeIcon onClose={this.handleCloseConfirmDelete} open={this.state.isOpenConfirmDelete} size="mini">
          <Header content={<TranslationText id="deleteForever" />} />
          <Modal.Content>
            <p>
              <TranslationText id="sure" />
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              icon
              negative
              onClick={e => {
                e.stopPropagation();
                deleteIdentifier(this.state.id).then(r => {
                  if (r.data.success === true) {
                    this.props.listIdentifier();
                  } else if (r.data.error === "E-205") {
                    this.context.error(t("msgIdentifierDeletionAlreadyUsed"));
                  }
                  this.reset();
                  this.handleCloseConfirmDelete();
                });
              }}
              size="tiny">
              <TranslationText id="confirm" />
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

IdentifierSettings.propTypes = {
  domains: PropTypes.shape({
    data: PropTypes.object,
  }),
  listIdentifier: PropTypes.func,
  t: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    domains: state.core_domain_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    listIdentifier: () => {
      return dispatch(listIdentifier());
    },
  };
};

const ConnectedIdentifierSettings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(IdentifierSettings));
export default ConnectedIdentifierSettings;
