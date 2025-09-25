import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { useLithostratigraphies } from "../../../../../api/stratigraphy.ts";
import LithologyViewProfile from "../lithologyViewProfile.jsx";
import NavigationChild from "../navigationChild.jsx";
import NavigationContainer from "../navigationContainer.jsx";
import NavigationLens from "../navigationLens.jsx";
import Scale from "../scale.jsx";
import LithostratigraphyEditProfile from "./lithostratigraphyEditProfile.jsx";
import LithostratigraphyViewProfile from "./lithostratigraphyViewProfile.jsx";

const LithostratigraphyPanel = ({ stratigraphyId }) => {
  const { data: layers } = useLithostratigraphies(stratigraphyId);
  const { t } = useTranslation();

  const layerCount = layers?.length ?? 0;
  const minHeight = Math.max(500, (layerCount + 1) * 150);

  return (
    <NavigationContainer
      sx={{ gap: "0.5em", minHeight: minHeight + "px" }}
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
                  <>
                    <LithostratigraphyViewProfile
                      navState={lensNavState}
                      setNavState={setLensNavState}
                      stratigraphyId={stratigraphyId}
                    />
                    {/*<LithologyViewProfile*/}
                    {/*  navState={lensNavState}*/}
                    {/*  setNavState={setLensNavState}*/}
                    {/*  stratigraphyId={stratigraphyId}*/}
                    {/*  minPixelHeightForDepthLabel={Number.MAX_VALUE}*/}
                    {/*/>*/}
                  </>
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
              {/*<LithologyViewProfile stratigraphyId={stratigraphyId} navState={navState} setNavState={setNavState} />*/}
            </NavigationChild>
            <NavigationChild
              sx={{ flex: "0 0 4em" }}
              navState={navState}
              setNavState={setNavState}
              header={<Typography>{t("depthMD")}</Typography>}>
              <Scale navState={navState} />
            </NavigationChild>
            <LithostratigraphyEditProfile
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

export default LithostratigraphyPanel;
