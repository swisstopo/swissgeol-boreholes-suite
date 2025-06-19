import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../../editStateContext.tsx";
import LithologyViewProfile from "../lithologyViewProfile.jsx";
import NavigationChild from "../navigationChild.jsx";
import NavigationContainer from "../navigationContainer.jsx";
import NavigationLens from "../navigationLens.jsx";
import Scale from "../scale.jsx";
import StratigraphySelection from "../stratigraphySelection.jsx";
import LithostratigraphyEditProfile from "./lithostratigraphyEditProfile.jsx";
import LithostratigraphyViewProfile from "./lithostratigraphyViewProfile.jsx";

const LithostratigraphyPanel = () => {
  const { id: selectedBoreholeId } = useRequiredParams();
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);

  return (
    <StratigraphySelection
      id={selectedBoreholeId}
      noStratigraphiesMessageKey={editingEnabled ? "msgLithostratigraphyEmptyEditing" : "msgLithostratigraphyEmpty"}
      renderItem={stratigraphyId => (
        <NavigationContainer
          sx={{ gap: "0.5em" }}
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
                        <LithologyViewProfile
                          navState={lensNavState}
                          setNavState={setLensNavState}
                          stratigraphyId={stratigraphyId}
                          minPixelHeightForDepthLabel={Number.MAX_VALUE}
                        />
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
                  <LithologyViewProfile stratigraphyId={stratigraphyId} navState={navState} setNavState={setNavState} />
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
      )}
    />
  );
};

export default LithostratigraphyPanel;
