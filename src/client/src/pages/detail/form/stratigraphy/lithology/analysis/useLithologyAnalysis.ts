import { useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useClassifyLithologicalDescription } from "../../../../../../api/dataextraction.ts";
import { useCodelists } from "../../../../../../components/codelist.ts";
import { FieldChange, FieldValue } from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { buildLithologyValuesForMode } from "../form/lithologyUtils.ts";
import { mapClassificationToChanges, ModeChange } from "./classificationMapping.ts";

export interface LithologyAnalysis {
  changeByPath: Map<string, FieldChange>;
  isPending: boolean;
  /** True while any field row or the mode change still waits for the user. */
  hasPendingChanges: boolean;
  /** Runs the classification and resolves with the number of items now waiting for the user. */
  run: (description: string) => Promise<number>;
  acceptField: (path: string) => void;
  resetField: (path: string) => void;
  acceptAll: () => void;
  resetAll: () => void;
  discard: () => void;
  modeChange?: ModeChange;
}

interface AnalysisState {
  changes: FieldChange[];
  snapshot?: LithologyFormValues;
  modeChange?: ModeChange;
}

const emptyState: AnalysisState = { changes: [] };

/**
 * Runs the automatic classification for the open lithology modal and owns the quality control that
 * follows it: which fields it wrote, what they held before, and how to take back one field, the
 * mode change, or everything.
 *
 * The baseline is the live form state at the moment the analysis runs, so unsaved manual edits are
 * what a reset restores.
 * @param formMethods The modal's form, which the analysis writes to.
 */
export const useLithologyAnalysis = (formMethods: UseFormReturn<LithologyFormValues>): LithologyAnalysis => {
  const { data: codelists } = useCodelists();
  const { mutateAsync: classify, isPending } = useClassifyLithologicalDescription();
  const [state, setState] = useState<AnalysisState>(emptyState);

  const writeValue = useCallback(
    (path: string, value: FieldValue) => {
      formMethods.setValue(path as never, value as never, { shouldDirty: true, shouldValidate: true });
    },
    [formMethods],
  );

  const run = useCallback(
    async (description: string) => {
      const snapshot = formMethods.getValues();
      const response = await classify(description);
      const { changes, modeChange } = mapClassificationToChanges(response, codelists ?? [], snapshot);

      if (modeChange) {
        formMethods.reset(buildLithologyValuesForMode(snapshot, modeChange.next));
      }
      changes.forEach(change => writeValue(change.path, change.next));

      setState({ changes, snapshot, modeChange });
      return changes.length + (modeChange ? 1 : 0);
    },
    [classify, codelists, formMethods, writeValue],
  );

  const dropChange = useCallback((path: string) => {
    setState(current => {
      const changes = current.changes.filter(change => change.path !== path);
      if (changes.length === 0 && !current.modeChange) return emptyState;
      return { ...current, changes };
    });
  }, []);

  const acceptField = useCallback((path: string) => dropChange(path), [dropChange]);

  const resetField = useCallback(
    (path: string) => {
      const change = state.changes.find(candidate => candidate.path === path);
      if (!change) return;
      writeValue(path, change.previous);
      dropChange(path);
    },
    [dropChange, state.changes, writeValue],
  );

  const acceptAll = useCallback(() => setState(emptyState), []);

  const resetAll = useCallback(() => {
    if (state.modeChange && state.snapshot) {
      // Only a full reset brings back the values of the mode that was left.
      formMethods.reset(state.snapshot);
    } else {
      state.changes.forEach(change => writeValue(change.path, change.previous));
    }
    setState(emptyState);
  }, [formMethods, state.changes, state.modeChange, state.snapshot, writeValue]);

  const discard = useCallback(() => setState(emptyState), []);

  const changeByPath = useMemo(() => new Map(state.changes.map(change => [change.path, change])), [state.changes]);

  return {
    changeByPath,
    modeChange: state.modeChange,
    isPending,
    hasPendingChanges: state.changes.length > 0 || state.modeChange !== undefined,
    run,
    acceptField,
    resetField,
    acceptAll,
    resetAll,
    discard,
  };
};
