import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import TranslationText from "../../form/translationText";
import { Header, Icon, Menu, Modal } from "semantic-ui-react";
import { AlertContext } from "../../../components/alert/alertContext";
import SearchEditorComponent from "../../search/editor/searchEditorComponent";
import ActionsModal from "./actions/actionsModal";

let isMounted = true;

class MenuEditorSearch extends React.Component {
  static contextType = AlertContext;
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.setState = this.setState.bind(this);
    this.refresh = this.props.refresh.bind(this);
    const wgs = this.props.user.data.workgroups.filter(w => w.disabled === null && w.supplier === false);
    this.state = {
      creating: false,
      delete: false,
      enabledWorkgroups: wgs,
      modal: false,
      upload: false,
      selectedFile: null,
      selectedBoreholeAttachments: null,
      selectedLithologyFile: null,
      scroller: false,
      workgroup: wgs !== null && wgs.length > 0 ? wgs[0].id : null,
      validationErrorModal: false,
      errosResponse: null,
    };
  }

  componentDidMount() {
    if (isMounted) {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions.bind(this));
    }
  }

  componentWillUnmount() {
    isMounted = false;
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    if (!_.isNil(this.menu) && this.menu.children.length > 0) {
      const height = this.menu.clientHeight;
      const childrenHeight = this.menu.children[0].clientHeight;
      this.setState({
        scroller: childrenHeight > height,
      });
    } else {
      this.setState({
        scroller: true,
      });
    }
  }

  render() {
    const { boreholes, t } = this.props;
    return [
      <div
        key="sb-em-1"
        style={{
          color: boreholes.isFetching === false && boreholes.dlen === 0 ? "red" : "#767676",
          borderBottom: "thin solid rgb(187, 187, 187)",
          padding: "1em 1em 0px 1em",
        }}>
        <TranslationText firstUpperCase id="boreholes" />:{" "}
        {boreholes.isFetching ? (
          <Icon loading name="spinner" />
        ) : (
          <NumericFormat value={boreholes.dlen} thousandSeparator="'" displayType="text" />
        )}
      </div>,
      <div
        className={this.state.scroller === true ? "scroller" : null}
        key="sb-em-2"
        ref={divElement => (this.menu = divElement)}
        style={{
          padding: "1em",
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "hidden",
          marginRight: this.state.scroller === true ? this.props.setting.scrollbar : "0px",
        }}>
        <SearchEditorComponent onChange={() => {}} />
      </div>,
      <Menu
        icon="labeled"
        key="sb-em-3"
        size="mini"
        style={{
          borderTop: "thin solid rgb(187, 187, 187)",
          margin: "0px",
        }}>
        <Menu.Item
          onClick={() => {
            this.props.refresh();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon loading={boreholes.isFetching} name="refresh" size="tiny" />
          <TranslationText firstUpperCase id="refresh" />
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            this.props.reset();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="undo" size="tiny" />
          <TranslationText firstUpperCase id="reset" />
        </Menu.Item>
      </Menu>,
      <Menu
        icon="labeled"
        key="sb-em-4"
        size="mini"
        style={{
          margin: "0px",
        }}>
        <Menu.Item
          disabled={this.props.user.data.roles.indexOf("EDIT") === -1}
          data-cy="import-borehole-button"
          onClick={() => {
            this.setState({
              modal: true,
              upload: true,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="upload" size="tiny" />
          <TranslationText firstUpperCase id="import" />
        </Menu.Item>
        <Menu.Item
          disabled={this.props.user.data.roles.indexOf("EDIT") === -1}
          data-cy="new-borehole-button"
          onClick={() => {
            this.setState({
              modal: true,
              upload: false,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="add" size="tiny" />
          <TranslationText firstUpperCase extra={{ what: "borehole" }} id="new" />
        </Menu.Item>
      </Menu>,
      <Modal
        closeIcon
        key="sb-em-5"
        onClose={() => {
          this.setState({
            modal: false,
          });
        }}
        open={this.state.modal === true}
        size="large">
        <ActionsModal setState={this.setState} state={this.state} refresh={this.refresh} />
      </Modal>,
      <Modal
        closeIcon
        key="sb-em-5-2"
        onClose={() => {
          this.setState({
            validationErrorModal: false,
          });
        }}
        open={this.state.validationErrorModal === true}
        size="tiny">
        <Header content={t("validationErrorHeader")} />
        <Modal.Content style={{ maxHeight: "70vh", overflow: "auto" }} data-cy="borehole-import-error-modal-content">
          {this.state.errorResponse && (
            <div>
              {/* In case of API response type ProblemDetails */}
              {this.state.errorResponse.detail &&
                this.state.errorResponse.detail
                  .split("\n")
                  .filter(subString => subString.includes("was not found"))
                  .map((item, i) => <li key={item + i}>{item}</li>)}
              {/* In case of API response type ValidationProblemDetails */}
              {this.state.errorResponse.errors &&
                Object.entries(this.state.errorResponse.errors)
                  // Only display error messages for keys that are not empty
                  .filter(([key]) => key !== "")
                  .map(([key, value], index) => (
                    <div key={key + index + 1}>
                      <div>{key}</div>
                      {value.map((item, i) => (
                        <li key={item + i}>{item}</li>
                      ))}
                    </div>
                  ))}
            </div>
          )}
        </Modal.Content>
      </Modal>,
    ];
  }
}

const mapStateToProps = state => {
  return {
    search: state.search,
    editor: state.editor,
    borehole: state.core_borehole,
    boreholes: state.core_borehole_editor_list,
    setting: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSelected: borehole => {
      dispatch({
        path: "/borehole",
        type: "CLEAR",
      });
      dispatch({
        type: "EDITOR_BOREHOLE_SELECTED",
        selected: borehole,
      });
    },
    refresh: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_REFRESH",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
  };
};

const ConnectedMenuEditorSearch = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(MenuEditorSearch)),
);
export default ConnectedMenuEditorSearch;
