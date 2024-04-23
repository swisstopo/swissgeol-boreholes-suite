/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext, useMemo, memo } from "react";
import { Stack, Button, Box } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import styled from "@mui/material/styles/styled";
import { Basemap } from "./Basemap";
import { basemaps } from "./basemaps";
import { BasemapContext } from "./basemapContext";

const BasemapSelectorBox = styled(Box)({
  position: "absolute",
  right: "12px",
  backgroundColor: "#f1f3f5",
  boxShadow: "4px 4px 2px #00000029",
  padding: "0.3em",
  borderRadius: "100px",
});

const BasemapButton = styled(Button)({
  borderRadius: "50%",
  padding: 0,
  animationTimingFunction: "ease-in-out",
  animationDuration: "0.4s",
  minWidth: 0,
  margin: 0,
  "&:hover": {
    opacity: "60%",
  },
});

const ImageBox = styled(Box)({
  borderRadius: "50%",
  display: "block",
  position: "relative",
  overflow: "hidden",
  width: "50px",
  height: "50px",
  margin: 0,
  padding: 0,
  backgroundColor: "white",
});

const LargerImageBox = styled(ImageBox)({ height: "60px", width: "60px" });

export const BasemapSelector = memo(({ setState, marginBottom }: { setState: any; marginBottom: string }) => {
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const { currentBasemapName, setBasemapName } = useContext(BasemapContext);

  const imageUrlMap = useMemo(() => {
    return basemaps.reduce(
      (acc, layer) => {
        acc[layer.shortName] = new URL(
          `./img/${layer.previewImg || "ch.swisstopo.pixelkarte-farbe"}.png`,
          import.meta.url,
        ).href;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, []);

  const onSelectBackground = (layerName: string) => {
    setBasemapName(layerName);
    // Sets basemap display in parent component
    setState({ basemap: layerName }, () => {
      basemaps.forEach(bm => {
        const isVisible = layerName !== "nomap" && bm.shortName === layerName;
        bm.layer.setVisible(isVisible);
      });
    });
  };

  const toggleShowSelector = () => {
    setShowSelector(!showSelector);
  };

  return (
    <BasemapSelectorBox sx={{ bottom: marginBottom }}>
      {showSelector ? (
        <Stack sx={{ padding: "0.2em" }} direction="row">
          <Box>
            <Stack direction="row">
              {basemaps.map((layer: Basemap) => (
                <BasemapButton
                  key={layer.shortName}
                  sx={{
                    border: `${layer.shortName === currentBasemapName ? "2px solid #cb5d53" : "none"}`,
                    marginRight: "1em",
                    marginLeft: 0,
                  }}
                  onClick={() => onSelectBackground(layer.shortName)}>
                  <ImageBox>{layer && <img src={imageUrlMap[layer.shortName]} />}</ImageBox>
                </BasemapButton>
              ))}
              <BasemapButton
                sx={{
                  padding: "0.2em",
                  border: `${"nomap" === currentBasemapName ? "2px solid #cb5d53" : "none"}`,
                }}
                onClick={() => onSelectBackground("nomap")}>
                <ImageBox sx={{ backgroundColor: "white" }}></ImageBox>
              </BasemapButton>
              <BasemapButton sx={{ padding: "0.2em" }} onClick={toggleShowSelector}>
                <ClearIcon fontSize="large" sx={{ margin: "0.3em" }}></ClearIcon>
              </BasemapButton>
            </Stack>
          </Box>
        </Stack>
      ) : (
        <BasemapButton onClick={toggleShowSelector}>
          {currentBasemapName == "nomap" ? (
            <LargerImageBox></LargerImageBox>
          ) : (
            <LargerImageBox>{currentBasemapName && <img src={imageUrlMap[currentBasemapName]} />}</LargerImageBox>
          )}
        </BasemapButton>
      )}
    </BasemapSelectorBox>
  );
});
