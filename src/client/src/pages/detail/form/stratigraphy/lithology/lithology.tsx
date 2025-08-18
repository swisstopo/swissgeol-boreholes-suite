import { FC, useContext, useState } from "react";
import { Stack } from "@mui/material";
import { Box } from "@mui/system";
import { StratigraphyLegacy } from "../../../../../api/stratigraphy.ts";
import { EditStateContext } from "../../../editStateContext.tsx";
import { stratigraphyData } from "./data/stratigraphydata.js";
import LithologyAttributes from "./lithologyAttributes";
import ProfileLayers from "./lithologyLayers";

interface LithologyProps {
  stratigraphy: StratigraphyLegacy;
}

export const Lithology: FC<LithologyProps> = ({ stratigraphy }) => {
  const { editingEnabled } = useContext(EditStateContext);
  const [selectedLayer, setSelectedLayer] = useState<{ id: number } | null>(null);
  const [reloadLayer, setReloadLayer] = useState(0);
  const [reloadAttribute, setReloadAttribute] = useState(0);

  const onUpdated = (attribute: string) => {
    if (attribute === "toDepth" || attribute === "fromDepth" || attribute === "lithology" || attribute === "newLayer") {
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "deleteLayer" || attribute === "fixErrors") {
      setSelectedLayer(null);
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "deleteStratigraphy" || attribute === "newAttribute") {
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "newAttribute") {
      setReloadAttribute(reloadAttribute => reloadAttribute + 1);
    }
  };

  return (
    <Stack direction="row" sx={{ overflow: "auto" }}>
      <Box sx={{ flex: 1 }}>
        <ProfileLayers
          data={{
            selectedStratigraphyID: stratigraphy.id,
            isEditable: editingEnabled,
            selectedLayer,
            setSelectedLayer: (e: { id: number }) => {
              setSelectedLayer(e);
            },
            reloadLayer,
            onUpdated,
          }}
        />
      </Box>
      {selectedLayer !== null && (
        <Box sx={{ flex: 1 }}>
          <LithologyAttributes
            id={selectedLayer?.id}
            setReloadLayer={setReloadLayer}
            setSelectedLayer={setSelectedLayer}
            data={{
              selectedStratigraphyID: stratigraphy.id,
              isEditable: editingEnabled,
              onUpdated,
              reloadAttribute,
              layerAttributes: stratigraphyData.profileAttribute,
            }}
          />
        </Box>
      )}
    </Stack>
  );
};
