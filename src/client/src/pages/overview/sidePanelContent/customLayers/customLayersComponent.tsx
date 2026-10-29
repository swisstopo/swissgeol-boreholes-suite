import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Checkbox, FormControlLabel, IconButton, Stack } from "@mui/material";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { theme } from "../../../../AppTheme.ts";
import { LayerConfig } from "../../../../components/map/map.ts";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";

interface CustomLayersComponentProps {
  isFetching: boolean;
  layers: Record<string, LayerConfig>;
  moveDown: (layer: LayerConfig) => void;
  moveUp: (layer: LayerConfig) => void;
  toggleDrawer: (open: boolean) => void;
  saveTransparency: (layer: LayerConfig) => void;
  toggleVisibility: (layer: LayerConfig) => void;
}

export const CustomLayersComponent: FC<CustomLayersComponentProps> = ({
  isFetching,
  layers,
  moveDown,
  moveUp,
  toggleDrawer,
  saveTransparency,
  toggleVisibility,
}) => {
  const len = Object.values(layers).length - 1;
  const { t } = useTranslation();

  return (
    <Stack sx={{ height: "100%" }}>
      <SideDrawerHeader title={t("overlay")} toggleDrawer={toggleDrawer} />
      <Box sx={{ overflow: "auto", scrollbarGutter: "stable", flex: 1 }}>
        {Object.values(layers)
          .sort((a, b) => {
            if (a.position < b.position) {
              return 1;
            } else if (a.position > b.position) {
              return -1;
            }
            return 0;
          })
          .map((layer, idx) => (
            <Box
              key={"ovls-" + idx}
              sx={{
                borderBottom: idx < len ? `thin solid ${theme.palette.border.light}` : null,
                padding: "0.5em 0px",
              }}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={layer.visibility}
                      disabled={isFetching === true}
                      onChange={() => {
                        toggleVisibility(layer);
                      }}
                    />
                  }
                  label={layer.Title}
                />
              </Box>
              <Box>
                {t("transparency")} ({layer.transparency}%)
              </Box>
              <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <Stack>
                  <input
                    max="100"
                    min="0"
                    onChange={ev => {
                      const updatedLayer = { ...layer, transparency: Number.parseFloat(ev.target.value) };
                      saveTransparency(updatedLayer);
                    }}
                    step="1"
                    type="range"
                    value={layer.transparency}
                  />
                </Stack>
                <Box>
                  <IconButton
                    aria-label={"move-up"}
                    disabled={idx === 0 || isFetching === true}
                    onClick={() => {
                      moveUp(layer);
                    }}
                    data-cy="add-layer-button">
                    <CircleArrowUp />
                  </IconButton>

                  <IconButton
                    aria-label={"move-up"}
                    disabled={idx === len || isFetching === true}
                    onClick={() => {
                      moveDown(layer);
                    }}
                    data-cy="add-layer-button">
                    <CircleArrowDown />
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          ))}
      </Box>
    </Stack>
  );
};
