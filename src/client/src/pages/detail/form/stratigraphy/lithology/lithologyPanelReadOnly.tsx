import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { NavigationChild } from "../navigation/NavigationChild.tsx";
import { NavigationContainer } from "../navigation/NavigationContainer.tsx";
import { Scale } from "../navigation/Scale.tsx";
import { FaciesDescription, LithologicalDescription, Lithology } from "../stratigraphy.ts";
import { LithologyTableScaled } from "./scaledTable/LithologyTableScaled.tsx";
import { NullDepthBanner } from "./scaledTable/nullDepthBanner.tsx";

interface LithologyPanelReadOnlyProps {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

// View-mode orchestrator for the lithology tab. Mounts the navigation shell (Scale + drag-pan +
// wheel-zoom from NavigationContainer) around the depth-scaled data columns. Layers with null
// depths are filtered for rendering inside LithologyTableScaled; the banner here surfaces the
// hidden count so users are aware of data anomalies.
export const LithologyPanelReadOnly: FC<LithologyPanelReadOnlyProps> = ({
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { t } = useTranslation();

  const hiddenCount = useMemo(
    () =>
      [...lithologies, ...lithologicalDescriptions, ...faciesDescriptions].filter(
        l => l.fromDepth === null || l.toDepth === null,
      ).length,
    [lithologies, lithologicalDescriptions, faciesDescriptions],
  );

  return (
    <Stack gap={1.5} sx={{ height: "100%" }}>
      <NullDepthBanner hiddenCount={hiddenCount} />
      <NavigationContainer
        renderItems={(navState, setNavState) => (
          <>
            <NavigationChild
              navState={navState}
              setNavState={setNavState}
              header={<Typography>{t("depthMD")}</Typography>}
              sx={{ flex: "0 0 64px" }}>
              <Scale navState={navState} />
            </NavigationChild>
            <LithologyTableScaled
              lithologies={lithologies}
              lithologicalDescriptions={lithologicalDescriptions}
              faciesDescriptions={faciesDescriptions}
              navState={navState}
              setNavState={setNavState}
            />
          </>
        )}
      />
    </Stack>
  );
};
