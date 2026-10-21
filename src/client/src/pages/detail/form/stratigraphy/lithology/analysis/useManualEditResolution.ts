import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { isModeChangeOpen, useConfirmModeChange } from "./useConfirmModeChange.tsx";
import { LithologyAnalysis } from "./useLithologyAnalysis.ts";

/**
 * Top-level fields whose edit leaves an open mode change open. The depths, the remarks and the
 * description are kept across modes. Bedding and its share only shape the layer, and the bedding
 * toggle writes the second description itself, so declining could not take that back.
 */
const fieldsOutsideMode = new Set([
  "fromDepth",
  "toDepth",
  "notes",
  "lithologicalDescription",
  "isUnconsolidated",
  "hasBedding",
  "share",
  "shareInverse",
]);

const belongsToMode = (path: string) => !fieldsOutsideMode.has(path.split(".")[0]);

/**
 * Resolves the row of a field the user edits by hand, because its value is then the user's, not the
 * analysis's. While the mode change is open that would make it final, so the user confirms first, and
 * declining puts the analysis's value back.
 *
 * An edit in another field of the new mode makes an open mode change final as well, after the same
 * confirmation, so a reset can no longer drop it with the mode. Declining puts back the value the
 * field had after the switch.
 * @param formMethods The modal's form, which the analysis writes to.
 * @param analysis The open analysis.
 */
export const useManualEditResolution = (
  formMethods: UseFormReturn<LithologyFormValues>,
  analysis: LithologyAnalysis,
) => {
  const { watch, resetField } = formMethods;
  // The analysis object is new on every render, so the subscription depends on its parts, which only
  // change with the analysis's state.
  const { changeByPath, acceptField, restoreAnalysisValue, fixModeChange, modeChange, isModeChangeFixed } = analysis;
  const confirmModeChange = useConfirmModeChange(modeChange, isModeChangeFixed);

  useEffect(() => {
    // A watch callback receives each update as it was emitted. A subscribe callback does not: it
    // merges the form state in, which keeps the name and type of the last input event, so a later
    // setValue or reset would look like a hand edit.
    const { unsubscribe } = watch((_, { name, type }) => {
      // Only an input event carries a type. The analysis's own writes and resets come without one.
      if (type !== "change" || !name) return;

      if (changeByPath.has(name)) {
        confirmModeChange(
          () => acceptField(name),
          () => restoreAnalysisValue(name),
        );
      } else if (isModeChangeOpen(modeChange, isModeChangeFixed) && belongsToMode(name)) {
        // The analysis switched the mode with a reset, so the default values are the ones of the switch.
        confirmModeChange(fixModeChange, () => resetField(name));
      }
    });
    return unsubscribe;
  }, [
    acceptField,
    changeByPath,
    confirmModeChange,
    fixModeChange,
    isModeChangeFixed,
    modeChange,
    resetField,
    restoreAnalysisValue,
    watch,
  ]);
};
