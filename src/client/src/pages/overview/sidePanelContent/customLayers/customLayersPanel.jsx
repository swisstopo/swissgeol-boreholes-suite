import PropTypes from "prop-types";
import { useMapOverlays } from "../../../../api/useMapOverlays";
import { CustomLayersComponent } from "./customLayersComponent.jsx";

const CustomLayersPanel = ({ toggleDrawer }) => {
  const { overlays, setVisibility, setTransparency, setPosition } = useMapOverlays();

  return (
    <CustomLayersComponent
      toggleDrawer={toggleDrawer}
      layers={overlays}
      moveDown={layer => setPosition(layer.Identifier, layer.position !== undefined ? layer.position - 1 : 0)}
      moveUp={layer => setPosition(layer.Identifier, layer.position !== undefined ? layer.position + 1 : 0)}
      saveTransparency={layer =>
        setTransparency(layer.Identifier, layer.transparency !== undefined ? layer.transparency : 0)
      }
      toggleVisibility={layer =>
        setVisibility(layer.Identifier, layer.visibility !== undefined ? !layer.visibility : true)
      }
    />
  );
};

CustomLayersPanel.propTypes = {
  toggleDrawer: PropTypes.func,
};

export default CustomLayersPanel;
