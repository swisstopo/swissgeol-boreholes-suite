import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import LithostratigraphyViewProfile from "../lithostratigraphy/lithostratigraphyViewProfile.jsx";
import { NavigationChild } from "../navigation/NavigationChild.tsx";
import { NavigationContainer } from "../navigation/NavigationContainer.tsx";
import { NavigationLens } from "../navigation/NavigationLens.tsx";
import { Scale } from "../navigation/Scale.tsx";
import ChronostratigraphyEditProfile from "./chronostratigraphyEditProfile.jsx";

const ChronostratigraphyPanel = ({ stratigraphyId }) => {
  const { t } = useTranslation();

  return (
    <NavigationContainer
      sx={{ gap: "0.5em", minHeight: "65vh", height: "100%" }}
      renderItems={(navState, setNavState) => {
        return (
          <>
            <NavigationChild
              moveChildren={false}
              sx={{ flex: "0 0 4em" }}
              navState={navState}
              setNavState={setNavState}>
              <NavigationLens
                navState={navState}
                setNavState={setNavState}
                renderBackground={(lensNavState, setLensNavState) => (
                  <LithostratigraphyViewProfile
                    navState={lensNavState}
                    setNavState={setLensNavState}
                    stratigraphyId={stratigraphyId}
                  />
                )}
              />
            </NavigationChild>
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
