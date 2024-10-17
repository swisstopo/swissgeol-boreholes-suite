import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { Button, Checkbox, Icon } from "semantic-ui-react";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";

export const CustomLayersComponent = ({
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
    <>
      <SideDrawerHeader title={t("overlay")} toggleDrawer={toggleDrawer} />
      <Box sx={{ overflow: "auto", scrollbarGutter: "stable", height: "85%" }}>
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
                borderBottom: idx < len ? "thin solid #dcdcdc" : null,
                padding: "0.5em 0px",
              }}>
              <Box>
                <Checkbox
                  checked={layer.visibility}
                  disabled={isFetching === true}
                  label={layer.Title}
                  onChange={() => {
                    toggleVisibility(layer);
                  }}
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
                      const updatedLayer = { ...layer, transparency: parseFloat(ev.target.value) };
                      saveTransparency(updatedLayer);
                    }}
                    step="1"
                    type="range"
                    value={layer.transparency}
                  />
                </Stack>
                <Box>
                  <Button
                    circular
                    compact
                    disabled={idx === 0 || isFetching === true}
                    icon
                    onClick={() => {
                      moveUp(layer);
                    }}
                    size="mini">
                    <Icon name="arrow up" />
                  </Button>
                  <Button
                    circular
                    compact
                    disabled={idx === len || isFetching === true}
                    icon
                    onClick={() => {
                      moveDown(layer);
                    }}
                    size="mini">
                    <Icon name="arrow down" />
                  </Button>
                </Box>
              </Stack>
            </Box>
          ))}
      </Box>
    </>
  );
};
