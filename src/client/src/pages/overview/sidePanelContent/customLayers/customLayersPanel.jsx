import { connect } from "react-redux";
import PropTypes from "prop-types";
import { patchSettings } from "../../../../api-lib";
import { CustomLayersComponent } from "./customLayersComponent.jsx";

const CustomLayersPanel = props => {
  return (
    <CustomLayersComponent
      toggleDrawer={props.toggleDrawer}
      layers={props.setting.data.map.explorer}
      moveDown={props.moveDown}
      moveUp={props.moveUp}
      saveTransparency={props.saveTransparency}
      setSelectedLayer={props.setSelectedLayer}
      toggleVisibility={props.toggleVisibility}
    />
  );
};

CustomLayersPanel.propTypes = {
  moveDown: PropTypes.func,
  moveUp: PropTypes.func,
  saveTransparency: PropTypes.func,
  setSelectedLayer: PropTypes.func,
  setting: PropTypes.object,
  toggleVisibility: PropTypes.func,
  toggleDrawer: PropTypes.func,
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

const ConnectedCustomLayersPanel = connect(mapStateToProps, mapDispatchToProps)(CustomLayersPanel);
export default ConnectedCustomLayersPanel;
