import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { LensColumn } from "../components/lensColumn/LensColumn.tsx";
import { getLithostratigraphyColor } from "../components/scaledLayerColumn/getLithostratigraphyColor.ts";
import { LithostratigraphyViewProfile } from "../lithostratigraphy/LithostratigraphyViewProfile.tsx";
import { NavigationChild } from "../navigation/NavigationChild.tsx";
import { NavigationContainer } from "../navigation/NavigationContainer.tsx";
import { Scale } from "../navigation/Scale.tsx";
import { useLithostratigraphies } from "../stratigraphy.ts";
import ChronostratigraphyEditProfile from "./chronostratigraphyEditProfile.jsx";

const ChronostratigraphyPanel = ({ stratigraphyId }) => {
  const { t } = useTranslation();
  const { data: lithostratigraphies = [] } = useLithostratigraphies(stratigraphyId);

  const validLayers = useMemo(
    () => lithostratigraphies.filter(l => l.fromDepth !== null && l.toDepth !== null),
    [lithostratigraphies],
  );

  const getColor = useCallback(layer => getLithostratigraphyColor(layer), []);

  const renderLensBackground = useCallback(
    (lensNavState, setLensNavState) => (
      <LithostratigraphyViewProfile
        navState={lensNavState}
        setNavState={setLensNavState}
        stratigraphyId={stratigraphyId}
      />
    ),
    [stratigraphyId],
  );

  return (
    <NavigationContainer
      sx={{ gap: "0.5em", minHeight: "65vh", height: "100%" }}
      renderItems={(navState, setNavState) => {
        return (
          <>
            <LensColumn
              layers={validLayers}
              navState={navState}
              setNavState={setNavState}
              getColor={getColor}
              sx={{ flex: "0 0 45px", paddingTop: `${navState.maxHeader}px` }}
            />
            <NavigationChild
              sx={{ flex: "0 0 8em" }}
              navState={navState}
              setNavState={setNavState}
              header={<Typography>{t("lithology")}</Typography>}>
              <LithostratigraphyViewProfile
                stratigraphyId={stratigraphyId}
                navState={navState}
                setNavState={setNavState}
              />
            </NavigationChild>
            <NavigationChild
              sx={{ flex: "0 0 4em" }}
              navState={navState}
              setNavState={setNavState}
              header={<Typography>{t("depthMD")}</Typography>}>
              <Scale navState={navState} />
            </NavigationChild>
            <ChronostratigraphyEditProfile
              selectedStratigraphyID={stratigraphyId}
              navState={navState}
              setNavState={setNavState}
            />
          </>
        );
      }}
    />
  );
};

export default ChronostratigraphyPanel;
