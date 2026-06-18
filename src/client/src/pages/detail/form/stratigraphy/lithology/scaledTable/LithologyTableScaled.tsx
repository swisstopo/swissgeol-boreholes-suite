import { Dispatch, FC, SetStateAction, useEffect, useMemo } from "react";
import { ScaledLayerColumn } from "../../components/scaledLayerColumn/ScaledLayerColumn.tsx";
import { NavigationChild } from "../../navigation/NavigationChild.tsx";
import { NavState } from "../../navigation/navState.ts";
import { FaciesDescription, LithologicalDescription, Lithology } from "../../stratigraphy.ts";
import { FaciesDescriptionLabels } from "../faciesDescriptionLabels.tsx";
import { LithologyLabels } from "../lithologyLabels.tsx";
import { LithologyDescriptionContent } from "./lithologyDescriptionContent.tsx";
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

  return (
    <>
      <NavigationChild navState={navState} setNavState={setNavState}>
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
              <LithologyDescriptionContent description={d} />
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
