import { FC, useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BaseLayer } from "../../../../../api/stratigraphy.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
import { SaveContext } from "../../../saveContext.tsx";
import { FaciesDescription, useFaciesDescriptionMutations } from "../faciesDescription.ts";
import { LithologicalDescription, useLithologicalDescriptionMutations } from "../lithologicalDescription.ts";
import { Lithology, useLithologyMutations } from "../lithology.ts";
import { LithologyTable } from "../lithologyTable.tsx";
import { StratigraphyContext, StratigraphyContextProps } from "../stratigraphyContext.tsx";
import { useLithologyTableState } from "../useLithologyTableState.ts";

interface LithologyPanelEditProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

type IdentifiableLayer = BaseLayer & { id: number };

/** Strip client-only fields before comparing to server data or sending over the wire. */
const stripClientFields = <T extends BaseLayer>(item: T): T => {
  const copy = { ...item } as T & { depthIds?: unknown; isAutoCorrected?: unknown };
  delete copy.depthIds;
  delete copy.isAutoCorrected;
  return copy as T;
};

interface ColumnDiff<T> {
  toDelete: T[];
  toAdd: T[];
  toUpdate: T[];
}

/** Bucket tmp items per server original: new (id===0), changed (json differs), or to be deleted. */
const diffColumn = <T extends IdentifiableLayer>(orig: T[], tmp: T[]): ColumnDiff<T> => {
  const tmpById = new Map<number, T>();
  for (const t of tmp) {
    if (t.id !== 0) tmpById.set(t.id, stripClientFields(t));
  }
  const toDelete = orig.filter(o => !tmpById.has(o.id));
  const toAdd = tmp.filter(t => t.id === 0).map(stripClientFields);
  const toUpdate: T[] = [];
  for (const o of orig) {
    const tmpItem = tmpById.get(o.id);
    if (!tmpItem) continue;
    if (JSON.stringify(tmpItem) !== JSON.stringify(o)) toUpdate.push(tmpItem);
  }
  return { toDelete, toAdd, toUpdate };
};

/**
 * Edit-mode subtree: owns the lithology-table state hook + save/reset registration. Lives in
 * its own component so it mounts only in edit mode — entering edit mode seeds the hook from
 * the freshly fetched server data, and leaving discards in-progress UI state. The hook
 * re-seeds whenever react-query updates the data props (e.g. after save+invalidate).
 */
export const LithologyPanelEdit: FC<LithologyPanelEditProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const { markAsChanged } = useContext(SaveContext);
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

  const lithology = useLithologyTableState(lithologies, lithologicalDescriptions, faciesDescriptions, stratigraphyId);

  useEffect(() => {
    markAsChanged(lithology.hasUnsavedChanges);
  }, [lithology.hasUnsavedChanges, markAsChanged]);

  const onSave = useCallback(async () => {
    if (lithology.hasErrors) {
      showAlert(t("gapOrOverlayErrorCannotSave"), "error");
      return false;
    }

    const lithologyDiff = diffColumn(lithologies, lithology.tmpLithologies);
    const lithDescDiff = diffColumn(lithologicalDescriptions, lithology.tmpLithologicalDescriptions);
    const faciesDiff = diffColumn(faciesDescriptions, lithology.tmpFaciesDescriptions);

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
    lithology,
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
    showAlert,
    t,
  ]);

  const onReset = useCallback(() => {
    lithology.reset();
  }, [lithology]);

  useEffect(() => {
    registerSaveHandler(onSave, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [onSave, onReset, registerSaveHandler, registerResetHandler]);

  return <LithologyTable state={lithology} />;
};
