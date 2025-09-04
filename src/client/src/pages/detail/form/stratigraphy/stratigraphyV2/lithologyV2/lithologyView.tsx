import { useState } from "react";
import { Box, Stack } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { LithologyLayers } from "./lithologyLayers.tsx";
import { OverviewScale } from "./overviewScale.tsx";
import { ScaleContext } from "./scaleContext.tsx";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

interface LithologyViewProps {
  lithologies: Lithology[];
}

export const LithologyView: FC<LithologyViewProps> = ({ lithologies }) => {
  const [translateY, setTranslateY] = useState(0);
  const [scaleY, setScaleY] = useState(1);
  return (
    <>
      {/*Header*/}
      <Stack direction={"row"} sx={{ position: "relative", width: "100%" }}>
        <Stack direction={"row"} spacing={1.5}>
          <Box sx={{ width: "45px", backgroundColor: "lightgrey" }}> Scoll </Box>
          <Box sx={{ width: "45px" }}></Box>
        </Stack>
        <Stack
          justifyContent="flex-start"
          direction="row"
          sx={{ height: theme.spacing(5), width: "100%", backgroundColor: theme.palette.background.listItemActive }}>
          <Box sx={{ flexGrow: 1, textAlign: "flex-start" }}> Header 1</Box>
          <Box sx={{ flexGrow: 1, textAlign: "flex-start" }}> Header 2</Box>
          <Box sx={{ flexGrow: 1, textAlign: "flex-start" }}> Header 3</Box>
        </Stack>
      </Stack>
      <ScaleContext.Provider
        value={{
          scaleY,
          setScaleY,
          translateY,
          setTranslateY,
        }}>
        {/*Scrolling area*/}
        <VerticalZoomPanWrapper>
          {/*Todo: Fix heigth based on available space*/}
          <Stack justifyContent="flex-start" direction="row" sx={{ height: "500px", width: "100%" }}>
            <OverviewScale lithologies={lithologies} />
            {/*Example for three layer "profiles"*/}
            <LithologyLayers lithologies={lithologies} sx={{ flexGrow: 1 }} />
            <LithologyLayers lithologies={lithologies} sx={{ flexGrow: 1 }} />
            <LithologyLayers lithologies={lithologies} sx={{ flexGrow: 1 }} />
          </Stack>
        </VerticalZoomPanWrapper>
      </ScaleContext.Provider>
      {/*Footer*/}
      <Stack direction={"row"} spacing={1.5}>
        <Box sx={{ width: "45px", backgroundColor: "lightgrey" }}> Scoll</Box>
        <Box sx={{ width: "45px" }}></Box>
      </Stack>
    </>
  );
};
