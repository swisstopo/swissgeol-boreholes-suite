import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useClassifyLithologicalDescription } from "../../../../../../api/dataextraction.ts";
import { ClassifyResponse, ClassifyVariables } from "../../../../../../api/dataextractionInterfaces.ts";
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
  /**
   * Runs the classification and resolves with the number of items now waiting for the user, or with
   * undefined when the analysis was discarded before the classification returned.
   */
  run: (description: string) => Promise<number | undefined>;
  acceptField: (path: string) => void;
  resetField: (path: string) => void;
  acceptAll: () => void;
  resetAll: () => void;
  /** Drops the analysis and cancels a running classification, leaving the form values as they are. */
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
 * The classification of a run, or undefined once the run was discarded. The request then either
 * rejects with the abort or, like the stand-in classification, completes regardless.
 */
const classifyUnlessDiscarded = async (
  classify: (variables: ClassifyVariables) => Promise<ClassifyResponse>,
  variables: ClassifyVariables,
): Promise<ClassifyResponse | undefined> => {
  try {
    const response = await classify(variables);
    return variables.signal.aborted ? undefined : response;
  } catch (error) {
    if (variables.signal.aborted) return undefined;
    throw error;
  }
};

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
  const runningClassification = useRef<AbortController | null>(null);

  const writeValue = useCallback(
    (path: string, value: FieldValue) => {
      formMethods.setValue(path as never, value as never, { shouldDirty: true, shouldValidate: true });
    },
    [formMethods],
  );

  const run = useCallback(
    async (description: string) => {
      const controller = new AbortController();
      runningClassification.current = controller;
      const snapshot = formMethods.getValues();
      const response = await classifyUnlessDiscarded(classify, { description, signal: controller.signal });
      if (!response) return undefined;
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

  const discard = useCallback(() => {
    runningClassification.current?.abort();
    setState(emptyState);
  }, []);

  useEffect(() => () => runningClassification.current?.abort(), []);

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
