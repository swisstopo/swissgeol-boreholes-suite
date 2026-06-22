import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { LithostratigraphyLayer } from "../../../../../api/generated";
import { theme } from "../../../../../AppTheme.ts";
import { LensColumn } from "../components/lensColumn/LensColumn.tsx";
import { getLithostratigraphyColor } from "../components/scaledLayerColumn/getLithostratigraphyColor.ts";
import { StratigraphyTableHeaderCell } from "../components/stratigraphyTableHeaderCell.tsx";
import { StratigraphyTableHeader } from "../components/stratigraphyTablePrimitives.tsx";
import { NavigationChild } from "../navigation/NavigationChild.tsx";
import { NavigationContainer } from "../navigation/NavigationContainer.tsx";
import { Scale } from "../navigation/Scale.tsx";
import { FaciesDescription, LithologicalDescription, Lithology, useLithostratigraphies } from "../stratigraphy.ts";
import { LithologyTableScaled } from "./scaledTable/LithologyTableScaled.tsx";
import { NullDepthBanner } from "./scaledTable/nullDepthBanner.tsx";

interface LithologyPanelReadOnlyProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

type LithostratiWithDepths = LithostratigraphyLayer & { fromDepth: number; toDepth: number };

// View-mode orchestrator for the lithology tab. Mounts the Lupe mini-overview and a collapsible
// Lithostratigraphie-Balken (when the borehole has lithostrati data) alongside the four data
// columns. All columns share the same NavState via NavigationContainer so dragging the Lupe's
// lens, wheel-zooming, and drag-panning the data area stay in sync.
export const LithologyPanelReadOnly: FC<LithologyPanelReadOnlyProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { t } = useTranslation();
  const { data: lithostratigraphies = [] } = useLithostratigraphies(stratigraphyId);

  const validLithostrati = useMemo<ReadonlyArray<LithostratiWithDepths>>(
    () => lithostratigraphies.filter((l): l is LithostratiWithDepths => l.fromDepth !== null && l.toDepth !== null),
    [lithostratigraphies],
  );

  // Memoised id → color map: parsing the Codelist `conf` JSON once per render of the panel
  // (not once per layer × cell) is critical because getLithostratigraphyColor runs JSON.parse
  // and the same lithostrati is shared with both the Lupe and the Bar.
  const colorByLithostratigraphyId = useMemo(() => {
    const map = new Map<number, string | undefined>();
    for (const lithostratigraphy of lithostratigraphies)
      map.set(lithostratigraphy.id, getLithostratigraphyColor(lithostratigraphy));
    return map;
  }, [lithostratigraphies]);
  const getColor = useCallback(
    (layer: { id: number }) => colorByLithostratigraphyId.get(layer.id),
    [colorByLithostratigraphyId],
  );

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
      <NavigationContainer
        sx={{
          // CSS grid pins the lens column's three pieces to the same rows as the table:
          display: "grid",
          gridTemplateColumns: "45px 1fr",
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: `
            "lens-up    header"
            "lens-body  body"
            "lens-down  ."
          `,
          columnGap: theme.spacing(1),
        }}
        renderItems={(navState, setNavState) => (
          <>
            <LensColumn<LithostratiWithDepths>
              layers={validLithostrati}
              navState={navState}
              setNavState={setNavState}
              getColor={getColor}
              layoutMode="split"
            />
            <StratigraphyTableHeader sx={{ gridArea: "header" }}>
              <StratigraphyTableHeaderCell sx={{ flex: "0 0 128px" }} label={t("depthMD")} />
              <StratigraphyTableHeaderCell label={t("lithology")} />
              <StratigraphyTableHeaderCell label={t("lithological_description")} />
              <StratigraphyTableHeaderCell label={t("facies_description")} />
            </StratigraphyTableHeader>
            <Stack
              direction="row"
              sx={{
                gridArea: "body",
                // Bottom edge of the table: drawn as a pseudo-element so it paints *over* any cell
                // that reaches the bottom (sharing the same pixel as the cell's borderBottom → 1px,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  backgroundColor: theme.palette.border.darker,
                  pointerEvents: "none",
                },
                "& > *": { borderLeft: `1px solid ${theme.palette.border.darker}` },
                "& > *:last-child": { borderRight: `1px solid ${theme.palette.border.darker}` },
              }}>
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
            </Stack>
          </>
        )}
      />
    </Stack>
  );
};
