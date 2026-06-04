import { FC, useCallback, useContext, useEffect } from "react";
import { SaveContext } from "../../../saveContext.tsx";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { prepareDataForSubmit } from "../components/lithologyTable/lithologyTableUtils.ts";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import { useFaciesDescriptionMutations } from "../faciesDescription.ts";
import { useLithologicalDescriptionMutations } from "../lithologicalDescription.ts";
import { useLithologyMutations } from "../lithology.ts";
import { BaseLayer, FaciesDescription, LithologicalDescription, Lithology } from "../stratigraphy.ts";
import { StratigraphyContext, StratigraphyContextProps } from "../stratigraphyContext.tsx";

interface LithologyPanelEditProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

interface ColumnDiff<T> {
  toDelete: T[];
  toAdd: T[];
  toUpdate: T[];
}

const diffColumn = <T extends BaseLayer>(orig: T[], tmp: T[]): ColumnDiff<T> => {
  const tmpById = new Map<number, T>();
  for (const t of tmp) {
    if (t.id !== 0) tmpById.set(t.id, t);
  }
  const toDelete = orig.filter(o => !tmpById.has(o.id));
  const toAdd = tmp.filter(t => t.id === 0);
  const toUpdate: T[] = [];
  for (const o of orig) {
    const tmpItem = tmpById.get(o.id);
    if (!tmpItem) continue;
    if (JSON.stringify(tmpItem) !== JSON.stringify(o)) toUpdate.push(tmpItem);
  }
  return { toDelete, toAdd, toUpdate };
};

export const LithologyPanelEdit: FC<LithologyPanelEditProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { setHasChanges, setHasErrors } = useContext(SaveContext);
  const { registerSaveHandler, registerResetHandler } = useContext<StratigraphyContextProps>(StratigraphyContext);

  const {
    add: { mutateAsync: addLithology },
    update: { mutateAsync: updateLithology },
    delete: { mutateAsync: deleteLithology },
    invalidateQueries: invalidateLithologyQueries,
  } = useLithologyMutations(true);
  const {
    add: { mutateAsync: addLithologicalDescription },
    update: { mutateAsync: updateLithologicalDescription },
    delete: { mutateAsync: deleteLithologicalDescription },
    invalidateQueries: invalidateLithologicalDescriptionQueries,
  } = useLithologicalDescriptionMutations(true);
  const {
    add: { mutateAsync: addFaciesDescription },
    update: { mutateAsync: updateFaciesDescription },
    delete: { mutateAsync: deleteFaciesDescription },
    invalidateQueries: invalidateFaciesDescriptionQueries,
  } = useFaciesDescriptionMutations(true);

  const lithologyTableState = useLithologyTableState(
    lithologies,
    lithologicalDescriptions,
    faciesDescriptions,
    stratigraphyId,
  );

  useEffect(() => {
    setHasChanges(lithologyTableState.hasUnsavedChanges);
  }, [lithologyTableState.hasUnsavedChanges, setHasChanges]);

  useEffect(() => {
    setHasErrors(lithologyTableState.hasErrors);
  }, [lithologyTableState.hasErrors, setHasErrors]);

  const onSave = useCallback(async () => {
    // Strip view-only fields once so the buckets are directly comparable to server data and
    // ready to ship to the API without further per-item transformation.
    const tmpLithologies = lithologyTableState.tmpLithologies.map(prepareDataForSubmit);
    const tmpLithDescriptions = lithologyTableState.tmpLithologicalDescriptions.map(prepareDataForSubmit);
    const tmpFaciesDescriptions = lithologyTableState.tmpFaciesDescriptions.map(prepareDataForSubmit);

    const lithologyDiff = diffColumn(lithologies, tmpLithologies);
    const lithDescDiff = diffColumn(lithologicalDescriptions, tmpLithDescriptions);
    const faciesDiff = diffColumn(faciesDescriptions, tmpFaciesDescriptions);

    await Promise.all([
      ...lithologyDiff.toDelete.map(l => deleteLithology(l)),
      ...lithologyDiff.toAdd.map(l => addLithology({ ...l, stratigraphyId })),
      ...lithologyDiff.toUpdate.map(l => updateLithology(l)),
      ...lithDescDiff.toDelete.map(d => deleteLithologicalDescription(d)),
      ...lithDescDiff.toAdd.map(d => addLithologicalDescription({ ...d, stratigraphyId })),
      ...lithDescDiff.toUpdate.map(d => updateLithologicalDescription(d)),
      ...faciesDiff.toDelete.map(d => deleteFaciesDescription(d)),
      ...faciesDiff.toAdd.map(d => addFaciesDescription({ ...d, stratigraphyId })),
      ...faciesDiff.toUpdate.map(d => updateFaciesDescription(d)),
    ]);

    // Refetching the server-of-truth data drives the hook's re-seed effect, which resets
    // both tmp arrays and the baseline → hasUnsavedChanges flips back to false naturally.
    invalidateLithologyQueries();
    invalidateLithologicalDescriptionQueries();
    invalidateFaciesDescriptionQueries();
    return true;
  }, [
    lithologyTableState,
    lithologies,
    lithologicalDescriptions,
    faciesDescriptions,
    stratigraphyId,
    addLithology,
    updateLithology,
    deleteLithology,
    addLithologicalDescription,
    updateLithologicalDescription,
    deleteLithologicalDescription,
    addFaciesDescription,
    updateFaciesDescription,
    deleteFaciesDescription,
    invalidateLithologyQueries,
    invalidateLithologicalDescriptionQueries,
    invalidateFaciesDescriptionQueries,
  ]);

  const onReset = useCallback(() => {
    lithologyTableState.reset();
  }, [lithologyTableState]);

  useEffect(() => {
    registerSaveHandler(onSave, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [onSave, onReset, registerSaveHandler, registerResetHandler]);

  return <LithologyTable state={lithologyTableState} />;
};
