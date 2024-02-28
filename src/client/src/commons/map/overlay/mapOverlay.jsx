import { connect } from "react-redux";
import PropTypes from "prop-types";

import MapOverlayComponent from "./mapOverlayCmp";

import { patchSettings } from "../../../api-lib/index";

const MapOverlay = props => {
  return (
    <MapOverlayComponent
      isFetching={props.setting.isFetching}
      layers={props.setting.data.map.explorer}
      moveDown={props.moveDown}
      moveUp={props.moveUp}
      saveTransparency={props.saveTransparency}
      setSelectedLayer={props.setSelectedLayer}
      setTransparency={props.setTransparency}
      toggleVisibility={props.toggleVisibility}
    />
  );
};

MapOverlay.propTypes = {
  moveDown: PropTypes.func,
  moveUp: PropTypes.func,
  saveTransparency: PropTypes.func,
  setSelectedLayer: PropTypes.func,
  setTransparency: PropTypes.func,
  setting: PropTypes.object,
  toggleVisibility: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    setting: state.setting,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    toggleVisibility: layer => {
      dispatch(
        patchSettings("map.explorer", layer.visibility !== undefined ? !layer.visibility : true, [
          layer.Identifier,
          "visibility",
        ]),
      );
    },
    setTransparency: (layer, value) => {
      dispatch({
        disableFetching: true,
        path: "/setting",
        type: "PATCH",
        tree: "map.explorer",
        value: value,
        key: [layer.Identifier, "transparency"],
      });
    },
    saveTransparency: layer => {
      dispatch(
        patchSettings("map.explorer", layer.transparency !== undefined ? layer.transparency : 0, [
          layer.Identifier,
          "transparency",
        ]),
      );
    },
    moveDown: layer => {
      dispatch(
        patchSettings("map.explorer", layer.position !== undefined ? layer.position - 1 : 0, [
          layer.Identifier,
          "position",
        ]),
      );
    },
    moveUp: layer => {
      dispatch(
        patchSettings("map.explorer", layer.position !== undefined ? layer.position + 1 : 0, [
          layer.Identifier,
          "position",
        ]),
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapOverlay);
