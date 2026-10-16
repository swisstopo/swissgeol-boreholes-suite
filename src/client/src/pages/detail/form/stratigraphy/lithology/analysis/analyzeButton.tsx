import { FC } from "react";
import { Control, useWatch } from "react-hook-form";
import { CircularProgress } from "@mui/material";
import { Sparkles } from "lucide-react";
import { BoreholesButton } from "../../../../../../components/buttons/buttons.tsx";
import { LithologyFormValues } from "../../stratigraphy.ts";

interface AnalyzeButtonProps {
  control: Control<LithologyFormValues>;
  isPending: boolean;
  /**
   * A new run would take the form, with the open analysis's values in it, as its baseline. That
   * loses the way back to what was there before, so the open analysis has to be resolved first.
   */
  hasPendingChanges: boolean;
  onAnalyze: (description: string) => void;
}

export const AnalyzeButton: FC<AnalyzeButtonProps> = ({ control, isPending, hasPendingChanges, onAnalyze }) => {
  const description = useWatch({ control, name: "lithologicalDescription.description" });
  const trimmedDescription = (description ?? "").trim();

  return (
    <BoreholesButton
      variant="contained"
      color="primary"
      label="runAnalysis"
      dataCy="analyze-button"
      icon={isPending ? <CircularProgress size={16} color="inherit" /> : <Sparkles />}
      disabled={isPending || hasPendingChanges || trimmedDescription.length === 0}
      onClick={() => onAnalyze(trimmedDescription)}
    />
  );
};
