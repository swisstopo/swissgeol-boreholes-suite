import { FC } from "react";
import { useMapOverlays } from "../../../../api/useMapOverlays.ts";
import { LayerConfig } from "../../../../components/map/map.ts";
import { CustomLayersComponent } from "./customLayersComponent.jsx";

interface CustomLayersPanelProps {
  toggleDrawer: (open: boolean) => void;
}

export const CustomLayersPanel: FC<CustomLayersPanelProps> = ({ toggleDrawer }) => {
  const { overlays, setVisibility, setTransparency, setPosition } = useMapOverlays();

  return (
    <CustomLayersComponent
      toggleDrawer={toggleDrawer}
      isFetching={false}
      layers={overlays}
      moveDown={(layer: LayerConfig) => setPosition(layer.Identifier, layer.position - 1)}
      moveUp={(layer: LayerConfig) => setPosition(layer.Identifier, layer.position + 1)}
      saveTransparency={(layer: LayerConfig) => setTransparency(layer.Identifier, layer.transparency)}
      toggleVisibility={(layer: LayerConfig) => setVisibility(layer.Identifier, !layer.visibility)}
    />
  );
};
