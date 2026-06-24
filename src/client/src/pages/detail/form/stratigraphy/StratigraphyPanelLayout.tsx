import { ComponentType, Dispatch, FC, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { LensColumn } from "./components/lensColumn/LensColumn.tsx";
import { LithostratigraphyViewProfile } from "./lithostratigraphy/LithostratigraphyViewProfile.tsx";
import { NavigationChild } from "./navigation/NavigationChild.tsx";
import { NavigationContainer } from "./navigation/NavigationContainer.tsx";
import { NavState } from "./navigation/navState.ts";
import { Scale } from "./navigation/Scale.tsx";

export interface EditProfileProps {
  selectedStratigraphyID: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

interface StratigraphyPanelLayoutProps {
  stratigraphyId: number;
  editProfileComponent: ComponentType<EditProfileProps>;
}

// Shared layout for lithostratigraphy and chronostratigraphy panels.
// Both panels display the same lens column, lithology view, and scale;
// only the edit profile differs.
export const StratigraphyPanelLayout: FC<StratigraphyPanelLayoutProps> = ({
  stratigraphyId,
  editProfileComponent: EditProfile,
}) => {
  const { t } = useTranslation();

  return (
    <NavigationContainer
      sx={{ gap: "0.5em", minHeight: "65vh", height: "100%" }}
      renderItems={(navState, setNavState) => {
        return (
          <>
            <LensColumn
              stratigraphyId={stratigraphyId}
              navState={navState}
              setNavState={setNavState}
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
            <EditProfile selectedStratigraphyID={stratigraphyId} navState={navState} setNavState={setNavState} />
          </>
        );
      }}
    />
  );
};
