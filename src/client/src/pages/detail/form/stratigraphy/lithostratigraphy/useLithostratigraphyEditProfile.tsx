import { Dispatch, SetStateAction, useCallback } from "react";
import { LithostratigraphyLayer } from "../../../../../api/generated";
import {
  HierarchicalDataEditProfileParts,
  HierarchicalLayer,
  NewLayerInput,
  useHierarchicalDataEditProfile,
} from "../hierarchicalDataEditProfile.tsx";
import { NavState } from "../navigation/navState.ts";
import { useLithostratigraphies, useLithostratigraphyMutations } from "../stratigraphy.ts";

const lithostratigraphyHeaderLabels = ["formation", "member", "bed"];

interface UseLithostratigraphyEditProfileArgs {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

// Wires the lithostratigraphy mutations and codelist schema into the shared HDEP hook so the
// litho panel can compose headerCells / layerStack / handleAddLayer into its grid layout.
export function useLithostratigraphyEditProfile({
  stratigraphyId,
  navState,
  setNavState,
}: UseLithostratigraphyEditProfileArgs): HierarchicalDataEditProfileParts {
  const { data: layers } = useLithostratigraphies(stratigraphyId);
  const {
    add: { mutate: addMutate },
    delete: { mutate: deleteMutate },
    update: { mutate: updateMutate },
  } = useLithostratigraphyMutations();

  // The API accepts partial layers (without id) for POST, but the generated TS type marks id as
  // required. Wrap mutate so the input shape stays honest at the call site.
  const addLayer = useCallback((input: NewLayerInput) => addMutate(input as LithostratigraphyLayer), [addMutate]);
  const updateLayer = useCallback(
    (layer: HierarchicalLayer) => updateMutate(layer as LithostratigraphyLayer),
    [updateMutate],
  );

  return useHierarchicalDataEditProfile({
    layerData: layers,
    addLayer,
    deleteLayer: deleteMutate,
    updateLayer,
    headerLabels: lithostratigraphyHeaderLabels,
    codelistSchemaName: "lithostratigraphy",
    dataProperty: "lithostratigraphyId",
    selectedStratigraphyID: stratigraphyId,
    navState,
    setNavState,
  });
}
