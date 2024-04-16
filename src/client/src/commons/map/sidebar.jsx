import MapOverlay from "./overlay/mapOverlay";
import { Dropdown } from "semantic-ui-react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import styled from "@mui/material/styles/styled";

const Sidebar = ({ sidebarRef, state, setState, layers, additionalMapLayers }) => {
  const { t } = useTranslation();

  const Title = styled(Typography)({
    fontWeight: "bold",
    paddingBottom: "0.5em",
  });

  const handleDropdownChange = (ev, data) => {
    setState({ basemap: data.value }, () => {
      layers.forEach(layer => {
        const layerName = layer.get("name");
        const isVisible = data.value !== "nomap" && layerName && layerName === data.value && layerName !== "points";
        layer.setVisible(isVisible);
      });
    });
  };

  return (
    <Box
      ref={sidebarRef}
      style={{
        backgroundColor: "#f3f3f3",
        display: state.sidebar ? "block" : "none",
        overflowY: "auto",
        width: "400px",
      }}>
      <Box
        sx={{
          padding: "2em 1em 1em 1em",
        }}>
        <Title>{t("common:background")}</Title>
        <Dropdown
          fluid
          onChange={handleDropdownChange}
          options={state.maps}
          search
          selection
          style={{
            minWidth: "10em",
          }}
          value={state.basemap}
        />
        {Object.keys(additionalMapLayers).length !== 0 && (
          <Title sx={{ paddingTop: "1em" }}>{t("common:overlay")}</Title>
        )}
        <MapOverlay
          setSelectedLayer={layer => {
            setState({
              selectedLayer: layer,
            });
          }}
        />
      </Box>
    </Box>
  );
};

export default Sidebar;
