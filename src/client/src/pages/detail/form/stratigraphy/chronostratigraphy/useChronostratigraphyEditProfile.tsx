import { Dispatch, SetStateAction, useCallback } from "react";
import { ChronostratigraphyLayer } from "../../../../../api/generated";
import {
  HierarchicalDataEditProfileParts,
  HierarchicalLayer,
  NewLayerInput,
  useHierarchicalDataEditProfile,
} from "../hierarchicalDataEditProfile.tsx";
import { NavState } from "../navigation/navState.ts";
import { useChronostratigraphies, useChronostratigraphyMutations } from "../stratigraphy.ts";

const chronostratigraphyHeaderLabels = ["eon", "era", "period", "epoch", "subepoch", "age", "subage"];

interface UseChronostratigraphyEditProfileArgs {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

// Wires the chronostratigraphy mutations and codelist schema into the shared HDEP hook so the
// chrono panel can compose headerCells / layerStack / handleAddLayer into its grid layout.
export function useChronostratigraphyEditProfile({
  stratigraphyId,
  navState,
  setNavState,
}: UseChronostratigraphyEditProfileArgs): HierarchicalDataEditProfileParts {
  const { data: layers } = useChronostratigraphies(stratigraphyId);
  const {
    add: { mutate: addMutate },
    delete: { mutate: deleteMutate },
    update: { mutate: updateMutate },
  } = useChronostratigraphyMutations();

  // The API accepts partial layers (without id) for POST, but the generated TS type marks id as
  // required. Wrap mutate so the input shape stays honest at the call site.
  const addLayer = useCallback((input: NewLayerInput) => addMutate(input as ChronostratigraphyLayer), [addMutate]);
  const updateLayer = useCallback(
    (layer: HierarchicalLayer) => updateMutate(layer as ChronostratigraphyLayer),
    [updateMutate],
  );

  return useHierarchicalDataEditProfile({
    layerData: layers as HierarchicalLayer[] | undefined,
    addLayer,
    deleteLayer: deleteMutate,
    updateLayer,
    headerLabels: chronostratigraphyHeaderLabels,
    codelistSchemaName: "chronostratigraphy",
    dataProperty: "chronostratigraphyId",
    selectedStratigraphyID: stratigraphyId,
    navState,
    setNavState,
  });
}
