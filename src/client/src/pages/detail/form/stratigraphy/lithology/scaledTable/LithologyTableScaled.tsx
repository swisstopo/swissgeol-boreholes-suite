import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo } from "react";
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

const getLayerKey = (layer: { id: number }) => layer.id;

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

  const renderLithologyLayer = useCallback(
    (layer: WithDepths<Lithology>) => (
      <ScaledCellShell dataCy={`lithology-${layer.fromDepth}-${layer.toDepth}`}>
        <LithologyLabels lithology={layer} />
      </ScaledCellShell>
    ),
    [],
  );

  const renderDescriptionLayer = useCallback(
    (layer: WithDepths<LithologicalDescription>) => (
      <ScaledCellShell dataCy={`lithologicalDescription-${layer.fromDepth}-${layer.toDepth}`}>
        <LithologicalDescriptionLabels description={layer} />
      </ScaledCellShell>
    ),
    [],
  );

  const renderFaciesLayer = useCallback(
    (layer: WithDepths<FaciesDescription>) => (
      <ScaledCellShell dataCy={`faciesDescription-${layer.fromDepth}-${layer.toDepth}`}>
        <FaciesDescriptionLabels description={layer} />
      </ScaledCellShell>
    ),
    [],
  );

  return (
    <>
      <NavigationChild navState={navState}>
        <ScaledLayerColumn
          layers={validLithologies}
          navState={navState}
          getKey={getLayerKey}
          minPixelHeight={1}
          renderLayer={renderLithologyLayer}
        />
      </NavigationChild>
      <NavigationChild navState={navState}>
        <ScaledLayerColumn
          layers={validDescriptions}
          navState={navState}
          getKey={getLayerKey}
          minPixelHeight={1}
          renderLayer={renderDescriptionLayer}
        />
      </NavigationChild>
      <NavigationChild navState={navState}>
        <ScaledLayerColumn
          layers={validFacies}
          navState={navState}
          getKey={getLayerKey}
          minPixelHeight={1}
          renderLayer={renderFaciesLayer}
        />
      </NavigationChild>
    </>
  );
};
