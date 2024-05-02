import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { Box } from "@mui/material";
import { AlertContext } from "../../../components/alert/alertContext";
import SearchEditorComponent from "../../search/editor/searchEditorComponent";
import ActionsModal from "./actions/actionsModal";
import { BoreholeNumbersPreview } from "./menuComponents/boreholeNumbersPreview";
import { ImportErrorModal } from "./menuComponents/importErrorModal";
import { MenuItems } from "./menuComponents/menuItems";

let isMounted = true;

class MenuEditorSearch extends React.Component {
  static contextType = AlertContext;
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.setState = this.setState.bind(this);
    this.refresh = this.props.refresh.bind(this);
    this.reset = this.props.reset.bind(this);
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
    const { boreholes } = this.props;
    return (
      <>
        <BoreholeNumbersPreview boreholes={boreholes} />,
        <Box
          className={this.state.scroller === true ? "scroller" : null}
          key="sb-em-2"
          ref={divElement => (this.menu = divElement)}
          sx={{
            padding: "1em",
            flex: "1 1 100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "hidden",
            marginRight: this.state.scroller === true ? this.props.setting.scrollbar : "0px",
          }}>
          <SearchEditorComponent onChange={() => {}} />
        </Box>
        <MenuItems
          boreholes={boreholes}
          refresh={this.refresh}
          reset={this.reset}
          user={this.props.user}
          setState={this.setState}
        />
        <ActionsModal setState={this.setState} state={this.state} refresh={this.refresh} />
        <ImportErrorModal setState={this.setState} state={this.state} />
      </>
    );
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
