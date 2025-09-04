import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { Lithology } from "../../lithology.ts";
import { LithologyLayers } from "./lithologyLayers.tsx";
import { ScaleContext } from "./scaleContext.tsx";
import { useFilledLayers } from "./useFilledLayers.tsx";
import { VerticalZoomPanWrapper } from "./VerticalZoomPanWrapper.tsx";

interface LithologyViewProps {
  lithologies: Lithology[];
}

export const LithologyView: FC<LithologyViewProps> = ({ lithologies }) => {
  const [translateY, setTranslateY] = useState(0);
  const [scaleY, setScaleY] = useState(1);
  const { t } = useTranslation();
  const { filledLayers: completedLithologies } = useFilledLayers(lithologies);

  console.log(lithologies, completedLithologies);

  return (
    <>
      {/*Header*/}
      <Stack direction={"row"} sx={{ position: "relative", width: "100%" }} spacing={1.5}>
        <Stack direction={"row"} spacing={1.5}>
          <Box sx={{ width: "45px" }}>
            <Button
              sx={{ height: "36px", mb: "6px" }}
              onClick={() =>
                setTranslateY(prev => {
                  const newValue = prev + 100 * scaleY;
                  return Math.min(newValue, 12);
                })
              }
              variant="outlined">
              <ChevronUp />
            </Button>
          </Box>
        </Stack>
        <Stack
          justifyContent="flex-start"
          direction="row"
          sx={{ height: theme.spacing(5), width: "100%", backgroundColor: theme.palette.background.listItemActive }}>
          <Box sx={{ width: "110px", textAlign: "flex-start", px: 2, py: 1 }}>{`${t("depth")} ${t("mMd")}`}</Box>
          <Box sx={{ flex: "1 0 0", textAlign: "flex-start", px: 2, py: 1 }}>{t("lithology")}</Box>
          <Box sx={{ flex: "1 0 0", textAlign: "flex-start", px: 2, py: 1 }}> {t("lithological_description")}</Box>
          <Box sx={{ flex: "1 0 0", textAlign: "flex-start", px: 2, py: 1 }}>{t("facies_description")}</Box>
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
            <LithologyLayers
              lithologies={lithologies}
              displayText={false}
              colorAttribute={"lithologyCon"}
              sx={{ width: "45px", flexShrink: 0, mr: theme.spacing(1.5) }}
            />
            <LithologyLayers lithologies={completedLithologies} sx={{ width: "110px" }} />
            <LithologyLayers lithologies={completedLithologies} sx={{ flex: "1 0 0" }} />
            <LithologyLayers lithologies={completedLithologies} sx={{ flex: "1 0 0" }} />
            <LithologyLayers lithologies={completedLithologies} sx={{ flex: "1 0 0" }} />
          </Stack>
        </VerticalZoomPanWrapper>
      </ScaleContext.Provider>
      {/*Footer*/}
      <Stack direction={"row"} spacing={1.5}>
        <Box sx={{ width: "45px" }}>
          <Button
            sx={{ height: "36px", mt: "6px" }}
            onClick={() => setTranslateY(prev => prev + 100 * scaleY)}
            variant="outlined">
            <ChevronDown />
          </Button>
        </Box>
        <Box sx={{ width: "45px" }}></Box>
      </Stack>
    </>
  );
};
