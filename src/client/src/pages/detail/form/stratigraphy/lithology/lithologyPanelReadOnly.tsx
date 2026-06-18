import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { StratigraphyTableHeaderCell } from "../components/stratigraphyTableHeaderCell.tsx";
import { StratigraphyTableHeader } from "../components/stratigraphyTablePrimitives.tsx";
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
    <Stack gap={1.5} sx={{ minHeight: "65vh", height: "100%" }}>
      <NullDepthBanner hiddenCount={hiddenCount} />
      <Stack sx={{ flex: 1 }}>
        <StratigraphyTableHeader>
          <StratigraphyTableHeaderCell sx={{ flex: "0 0 128px" }} label={t("depthMD")} />
          <StratigraphyTableHeaderCell label={t("lithology")} />
          <StratigraphyTableHeaderCell label={t("lithological_description")} />
          <StratigraphyTableHeaderCell label={t("facies_description")} />
        </StratigraphyTableHeader>
        <NavigationContainer
          sx={{
            "& > *": { borderLeft: `1px solid ${theme.palette.border.darker}` },
            "& > *:last-child": { borderRight: `1px solid ${theme.palette.border.darker}` },
          }}
          renderItems={(navState, setNavState) => (
            <>
              <NavigationChild navState={navState} setNavState={setNavState} sx={{ flex: "0 0 128px" }}>
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
    </Stack>
  );
};
