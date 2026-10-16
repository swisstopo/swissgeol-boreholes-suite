import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { useConfirmModeChange } from "./useConfirmModeChange.tsx";
import { LithologyAnalysis } from "./useLithologyAnalysis.ts";

/**
 * Resolves the row of a field the user edits by hand, because its value is then the user's, not the
 * analysis's. While the mode change is open that would make it final, so the user confirms first, and
 * declining puts the analysis's value back.
 * @param formMethods The modal's form, which the analysis writes to.
 * @param analysis The open analysis.
 */
export const useManualEditResolution = (
  formMethods: UseFormReturn<LithologyFormValues>,
  analysis: LithologyAnalysis,
) => {
  const { subscribe } = formMethods;
  // The analysis object is new on every render, so the subscription depends on its parts, which only
  // change with the analysis's state.
  const { changeByPath, acceptField, restoreAnalysisValue, modeChange, isModeChangeFixed } = analysis;
  const confirmModeChange = useConfirmModeChange(modeChange, isModeChangeFixed);

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ name, type }) => {
        // Only an input event carries a type. The analysis's own writes and resets come without one.
        if (type === "change" && name && changeByPath.has(name)) {
          confirmModeChange(
            () => acceptField(name),
            () => restoreAnalysisValue(name),
          );
        }
      },
    });
  }, [acceptField, changeByPath, confirmModeChange, restoreAnalysisValue, subscribe]);
};
