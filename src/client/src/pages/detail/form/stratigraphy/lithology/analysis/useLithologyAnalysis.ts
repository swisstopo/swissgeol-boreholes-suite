import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useClassifyLithologicalDescription } from "../../../../../../api/dataextraction.ts";
import { ClassifyResponse, ClassifyVariables } from "../../../../../../api/dataextractionInterfaces.ts";
import { useCodelists } from "../../../../../../components/codelist.ts";
import { FieldChange, FieldValue } from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { buildLithologyValuesForMode } from "../form/lithologyUtils.ts";
import {
  ClassificationChanges,
  LithologyFieldPath,
  mapClassificationToChanges,
  ModeChange,
} from "./classificationMapping.ts";

/**
 * Why a finished classification left nothing to review: the description carried nothing the form
 * can hold, or everything it carried is in the form already.
 */
export type EmptyAnalysisResult = "nothingRecognized" | "nothingNew";

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
  /** Writes the analysis's value back into a field the user edited by hand, keeping its row. */
  restoreAnalysisValue: (path: string) => void;
  acceptAll: () => void;
  resetAll: () => void;
  /** Drops the analysis and cancels a running classification, leaving the form values as they are. */
  discard: () => void;
  /** Closes the notice of an analysis that left nothing to review. */
  dismissEmptyResult: () => void;
  /** Makes the mode change final without resolving a row, for an edit in a field the analysis left alone. */
  fixModeChange: () => void;
  /** True once a field row was accepted after a mode change.*/
  isModeChangeFixed: boolean;
  modeChange?: ModeChange;
  /** Set when the last classification changed nothing, until the user closes its notice. */
  emptyResult?: EmptyAnalysisResult;
}

interface AnalysisState {
  changes: FieldChange<LithologyFieldPath>[];
  isModeChangeFixed: boolean;
  snapshot?: LithologyFormValues;
  modeChange?: ModeChange;
  emptyResult?: EmptyAnalysisResult;
}

const emptyState: AnalysisState = { changes: [], isModeChangeFixed: false };

const emptyResultOf = ({
  changes,
  modeChange,
  hasRecognizedValues,
}: ClassificationChanges): EmptyAnalysisResult | undefined => {
  if (changes.length > 0 || modeChange) return undefined;
  return hasRecognizedValues ? "nothingNew" : "nothingRecognized";
};

/** The analysis ends once no row is left and the mode change, if any, no longer waits for a decision. */
const isResolved = ({ changes, modeChange, isModeChangeFixed }: AnalysisState): boolean =>
  changes.length === 0 && (!modeChange || isModeChangeFixed);

const endIfResolved = (state: AnalysisState): AnalysisState => (isResolved(state) ? emptyState : state);

/**
 * The classification of a run, or undefined once the run was discarded. The request then either
 * rejects with the abort or, when the response arrived before the abort, completes regardless.
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
    (path: LithologyFieldPath, value: FieldValue) => {
      formMethods.setValue(path, value, { shouldDirty: true, shouldValidate: true });
    },
    [formMethods],
  );

  const run = useCallback(
    async (description: string) => {
      const controller = new AbortController();
      runningClassification.current = controller;
      const response = await classifyUnlessDiscarded(classify, { description, signal: controller.signal });
      if (!response) return undefined;
      // Taken after the response, so edits made while the request ran are part of the undo baseline.
      const snapshot = formMethods.getValues();
      const classificationChanges = mapClassificationToChanges(response, codelists ?? [], snapshot);
      const { changes, modeChange } = classificationChanges;

      if (modeChange) {
        formMethods.reset(buildLithologyValuesForMode(snapshot, modeChange.next));
      }
      changes.forEach(change => writeValue(change.path, change.next));

      setState({
        changes,
        snapshot,
        modeChange,
        isModeChangeFixed: false,
        emptyResult: emptyResultOf(classificationChanges),
      });
      return changes.length + (modeChange ? 1 : 0);
    },
    [classify, codelists, formMethods, writeValue],
  );

  const dropChange = useCallback((path: string, fixesModeChange: boolean) => {
    setState(current =>
      endIfResolved({
        ...current,
        changes: current.changes.filter(change => change.path !== path),
        isModeChangeFixed: current.isModeChangeFixed || (fixesModeChange && current.modeChange !== undefined),
      }),
    );
  }, []);

  const fixModeChange = useCallback(() => {
    setState(current => endIfResolved({ ...current, isModeChangeFixed: current.modeChange !== undefined }));
  }, []);

  const acceptField = useCallback((path: string) => dropChange(path, true), [dropChange]);

  const resetField = useCallback(
    (path: string) => {
      const change = state.changes.find(candidate => candidate.path === path);
      if (!change) return;
      writeValue(change.path, change.previous);
      dropChange(path, false);
    },
    [dropChange, state.changes, writeValue],
  );

  const restoreAnalysisValue = useCallback(
    (path: string) => {
      const change = state.changes.find(candidate => candidate.path === path);
      if (change) writeValue(change.path, change.next);
    },
    [state.changes, writeValue],
  );

  const acceptAll = useCallback(() => setState(emptyState), []);

  const resetAll = useCallback(() => {
    if (state.modeChange && !state.isModeChangeFixed && state.snapshot) {
      // Only a full reset before anything was accepted brings back the values of the mode that was left.
      // The description and the remarks are not mode scoped and the analysis never writes them, so
      // what the user typed there since the analysis stays.
      const { lithologicalDescription, notes } = formMethods.getValues();
      formMethods.reset({ ...state.snapshot, lithologicalDescription, notes });
    } else {
      state.changes.forEach(change => writeValue(change.path, change.previous));
    }
    setState(emptyState);
  }, [formMethods, state.changes, state.isModeChangeFixed, state.modeChange, state.snapshot, writeValue]);

  const discard = useCallback(() => {
    runningClassification.current?.abort();
    setState(emptyState);
  }, []);

  const dismissEmptyResult = useCallback(() => setState(current => ({ ...current, emptyResult: undefined })), []);

  useEffect(() => () => runningClassification.current?.abort(), []);

  const changeByPath = useMemo(() => new Map(state.changes.map(change => [change.path, change])), [state.changes]);

  return {
    changeByPath,
    modeChange: state.modeChange,
    emptyResult: state.emptyResult,
    isModeChangeFixed: state.isModeChangeFixed,
    isPending,
    hasPendingChanges: !isResolved(state),
    run,
    acceptField,
    resetField,
    restoreAnalysisValue,
    acceptAll,
    resetAll,
    discard,
    dismissEmptyResult,
    fixModeChange,
  };
};
