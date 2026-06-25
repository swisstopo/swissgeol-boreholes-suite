import { FC, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Stack, TextField } from "@mui/material";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import {
  ExtractedLithologicalDescription,
  FaciesDescription,
  LithologicalDescription,
  Lithology,
} from "../stratigraphy.ts";

export interface StratigraphyExtractionItemState {
  tmpLithologies: Lithology[];
  tmpLithologicalDescriptions: LithologicalDescription[];
  hasErrors: boolean;
}

interface StratigraphyExtractionItemProps {
  index: number;
  descriptions: ExtractedLithologicalDescription[];
  visible: boolean;
  onStateChange: (index: number, state: StratigraphyExtractionItemState) => void;
  name: string;
  nameError?: string;
  onNameChange: (index: number, value: string) => void;
}

export const StratigraphyExtractionItem: FC<StratigraphyExtractionItemProps> = ({
  index,
  descriptions,
  visible,
  onStateChange,
  name,
  nameError,
  onNameChange,
}) => {
  const { t } = useTranslation();
  const state = useLithologyTableState([] as Lithology[], descriptions, [] as FaciesDescription[], 0, {
    mergeDepthsOnDescriptionResize: true,
  });
  const { tmpLithologies, tmpLithologicalDescriptions, hasErrors } = state;

  useEffect(() => {
    onStateChange(index, { tmpLithologies, tmpLithologicalDescriptions, hasErrors });
  }, [index, tmpLithologies, tmpLithologicalDescriptions, hasErrors, onStateChange]);

  // Capture whether the depths were already unset in the extraction result (once, on first seed).
  // The alert only reports a failed depth extraction: it shows while the extracted depths remain
  // unset and disappears once they are filled. Depths the user clears afterwards surface as a
  // per-field error in the table, not this alert.
  const initialHasUnsetDepthsRef = useRef<boolean | null>(null);
  if (initialHasUnsetDepthsRef.current === null && tmpLithologicalDescriptions.length > 0) {
    initialHasUnsetDepthsRef.current = tmpLithologicalDescriptions.some(
      d => d.fromDepth === null || d.toDepth === null,
    );
  }
  const currentHasUnsetDepths = tmpLithologicalDescriptions.some(d => d.fromDepth === null || d.toDepth === null);
  const hasUnsetDepths = initialHasUnsetDepthsRef.current === true && currentHasUnsetDepths;

  return (
    <Stack gap={2} sx={{ display: visible ? "flex" : "none" }}>
      <TextField
        required
        label={t("stratigraphyName")}
        value={name}
        error={!!nameError}
        helperText={nameError}
        onChange={event => onNameChange(index, event.target.value)}
        data-cy={`stratigraphy-name-${index}-formInput`}
      />
      {hasUnsetDepths && <Alert severity="error">{t("msgDepthsExtractionFailed")}</Alert>}
      <LithologyTable state={state} shownColumns={["lithologicalDescription"]} showAddRowButton={false} />
    </Stack>
  );
};
