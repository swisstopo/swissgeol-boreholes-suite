import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Modal } from "semantic-ui-react";
import { loadEditingBoreholes } from "../../../api-lib";
import MapComponent from "../../../components/map/mapComponent.jsx";
import MultipleForm from "../../../components/legacyComponents/multiple/multipleForm.jsx";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import BottomBarContainer from "../boreholeTable/bottomBarContainer";

class MapView extends React.Component {
  static contextType = FilterContext;
  constructor(props) {
    super(props);
    this.rowHover = null;
    this.state = {
      hover: null,
      maphover: null,
      tableScrollPosition: 0,
    };
  }

  render() {
    const { loadEditingBoreholes, search, store, setting, lock, boreholes, displayErrorMessage } = this.props;

    const {
      filterPolygon,
      setFilterPolygon,
      polygonSelectionEnabled,
      setPolygonSelectionEnabled,
      featureIds,
      setFeatureIds,
    } = this.context;
    return (
      <div
        style={{
          flex: "1 1.5 100%",
          display: "flex",
          flexDirection: "column",
        }}>
        <Modal
          onUnmount={() => {
            if (!(featureIds?.length === 0)) {
              loadEditingBoreholes(
                boreholes.page,
                boreholes.limit,
                search.filter,
                boreholes.orderby,
                boreholes.direction,
                featureIds,
              );
            }
          }}
          open={Array.isArray(store.mselected)}>
          <Modal.Content>
            <MultipleForm selected={store.mselected} />
          </Modal.Content>
        </Modal>
        <MapComponent
          searchState={{
            ...search,
          }}
          highlighted={this.state.hover !== null ? [this.state.hover.id] : []}
          hover={id => {
            this.setState({
              maphover: id,
            });
          }}
          layers={setting.data.map.explorer}
          selected={id => {
            if (id !== null) {
              lock(id);
            }
          }}
          polygonSelectionEnabled={polygonSelectionEnabled}
          setPolygonSelectionEnabled={setPolygonSelectionEnabled}
          filterPolygon={filterPolygon}
          setFilterPolygon={setFilterPolygon}
          setFeatureIds={setFeatureIds}
          displayErrorMessage={displayErrorMessage}
        />
        <BottomBarContainer boreholes={boreholes} loadEditingBoreholes={loadEditingBoreholes} search={search} />
      </div>
    );
  }
}

MapView.propTypes = {
  delete: PropTypes.func,
  boreholes: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  loadEditingBoreholes: PropTypes.func,
  lock: PropTypes.func,
  multipleSelected: PropTypes.func,
  search: PropTypes.object,
  store: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    boreholes: state.core_borehole_editor_list,
    search: state.filters,
    setting: state.setting,
    store: state.editor,
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch, ownprops) => {
  return {
    dispatch: dispatch,
    projectSelected: project => {
      dispatch({
        type: "EDITOR_PROJECT_SELECTED",
        selected: project,
      });
    },

    boreholeSelected: borehole => {
      dispatch({
        type: "EDITOR_BOREHOLE_SELECTED",
        selected: borehole,
      });
    },
    lock: id => {
      dispatch({
        type: "CLEAR",
        path: "/borehole",
      });
      ownprops.history.push("/" + id);
    },
    multipleSelected: (selection, filter = null) => {
      dispatch({
        type: "EDITOR_MULTIPLE_SELECTED",
        selection: selection,
        filter: filter,
      });
    },
    delete: (selection, filter = null) => {
      dispatch({
        type: "EDITOR_MULTIPLE_DELETION",
        selection: selection,
        filter: filter,
      });
    },
    loadEditingBoreholes: (page, limit = 100, filter = {}, orderby = "creation", direction = null, featureIds = []) => {
      dispatch(loadEditingBoreholes(page, limit, filter, orderby, direction, featureIds));
    },
  };
};

const ConnectedMapView = withRouter(connect(mapStateToProps, mapDispatchToProps)(MapView));
export default ConnectedMapView;
