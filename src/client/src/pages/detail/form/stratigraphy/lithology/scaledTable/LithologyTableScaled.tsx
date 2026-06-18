import { Dispatch, FC, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Box } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { ScaledLayerColumn } from "../../components/scaledLayerColumn/ScaledLayerColumn.tsx";
import { NavigationChild } from "../../navigation/NavigationChild.tsx";
import { NavState } from "../../navigation/navState.ts";
import { FaciesDescription, LithologicalDescription, Lithology } from "../../stratigraphy.ts";
import { FaciesDescriptionLabels } from "../faciesDescriptionLabels.tsx";
import { LithologyLabels } from "../lithologyLabels.tsx";
import { LithologicalDescriptionLabels } from "./lithologicalDescriptionLabels.tsx";
import { ScaledCellShell } from "./ScaledCellShell.tsx";

interface LithologyTableScaledProps {
  lithologies: ReadonlyArray<Lithology>;
  lithologicalDescriptions: ReadonlyArray<LithologicalDescription>;
  faciesDescriptions: ReadonlyArray<FaciesDescription>;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

type WithDepths<T> = T & { fromDepth: number; toDepth: number };

const hasDepths = <T extends { fromDepth: number | null; toDepth: number | null }>(layer: T): layer is WithDepths<T> =>
  layer.fromDepth !== null && layer.toDepth !== null;

// View-mode counterpart to the edit-mode LithologyTable. Renders the three lithology data columns
// (lithology, lithological description, facies description) in depth-proportional scale.
export const LithologyTableScaled: FC<LithologyTableScaledProps> = ({
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
  navState,
  setNavState,
}) => {
  const validLithologies = useMemo(() => lithologies.filter(hasDepths), [lithologies]);
  const validDescriptions = useMemo(() => lithologicalDescriptions.filter(hasDepths), [lithologicalDescriptions]);
  const validFacies = useMemo(() => faciesDescriptions.filter(hasDepths), [faciesDescriptions]);

  useEffect(() => {
    setNavState(prev =>
      prev
        .setContentHeightFromLayers("lithology", validLithologies)
        .setContentHeightFromLayers("lithologicalDescription", validDescriptions)
        .setContentHeightFromLayers("faciesDescription", validFacies),
    );
  }, [validLithologies, validDescriptions, validFacies, setNavState]);

  // Initial zoom calibration: measure the first lithology layer's natural content height via a
  // hidden offscreen render in the same column (so it inherits the column's actual width and
  // padding), then pick a lensSize that makes the first layer's pixel height equal that natural
  // height. Result: the first layer renders with all of its content visible — no clamping or
  // ellipsis at default zoom. Runs once; subsequent user-driven zoom/pan is left untouched.
  const firstLayerMeasureRef = useRef<HTMLDivElement | null>(null);
  const hasCalibratedRef = useRef(false);
  const firstValidLithology = validLithologies[0];

  useLayoutEffect(() => {
    if (hasCalibratedRef.current) return;
    if (!firstValidLithology) return;
    const measureEl = firstLayerMeasureRef.current;
    if (!measureEl) return;
    const naturalHeight = measureEl.scrollHeight;
    const thickness = firstValidLithology.toDepth - firstValidLithology.fromDepth;
    const availableHeight = navState.height - navState.maxHeader;
    if (thickness <= 0 || availableHeight <= 0 || naturalHeight <= 0 || navState.maxContent <= 0) {
      return;
    }
    // No artificial floor: for a very thin first layer with dense content the formula naturally
    // produces a lensSize < thickness, which means the layer fills the viewport top-down and the
    // user pans for the rest. Clamping to maxContent prevents zooming further out than the data
    // supports. firstValidLithology assumes API-sorted layers (smallest fromDepth first).
    const desiredLensSize = Math.min(navState.maxContent, (thickness * availableHeight) / naturalHeight);
    setNavState(prev => prev.setLensSize(desiredLensSize).setLensStart(0));
    hasCalibratedRef.current = true;
  }, [navState.height, navState.maxHeader, navState.maxContent, firstValidLithology, setNavState]);

  return (
    <>
      <NavigationChild navState={navState} setNavState={setNavState}>
        {!hasCalibratedRef.current && firstValidLithology && (
          <Box
            ref={firstLayerMeasureRef}
            sx={{
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              top: 0,
              left: 0,
              right: 0,
              padding: theme.spacing(1),
            }}>
            <LithologyLabels lithology={firstValidLithology} />
          </Box>
        )}
        <ScaledLayerColumn
          layers={validLithologies}
          navState={navState}
          getKey={l => l.id}
          minPixelHeight={1}
          renderLayer={layer => (
            <ScaledCellShell>
              <LithologyLabels lithology={layer} />
            </ScaledCellShell>
          )}
        />
      </NavigationChild>
      <NavigationChild navState={navState} setNavState={setNavState}>
        <ScaledLayerColumn
          layers={validDescriptions}
          navState={navState}
          getKey={d => d.id}
          minPixelHeight={1}
          renderLayer={d => (
            <ScaledCellShell>
              <LithologicalDescriptionLabels description={d} />
            </ScaledCellShell>
          )}
        />
      </NavigationChild>
      <NavigationChild navState={navState} setNavState={setNavState}>
        <ScaledLayerColumn
          layers={validFacies}
          navState={navState}
          getKey={f => f.id}
          minPixelHeight={1}
          renderLayer={f => (
            <ScaledCellShell>
              <FaciesDescriptionLabels description={f} />
            </ScaledCellShell>
          )}
        />
      </NavigationChild>
    </>
  );
};
