import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Stack } from "@mui/material";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import { FaciesDescription } from "../faciesDescription.ts";
import { ExtractedLithologicalDescription, LithologicalDescription } from "../lithologicalDescription.ts";
import { Lithology } from "../lithology.ts";

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
}

export const StratigraphyExtractionItem: FC<StratigraphyExtractionItemProps> = ({
  index,
  descriptions,
  visible,
  onStateChange,
}) => {
  const { t } = useTranslation();
  const state = useLithologyTableState([] as Lithology[], descriptions, [] as FaciesDescription[], 0);
  const { tmpLithologies, tmpLithologicalDescriptions, hasErrors } = state;

  useEffect(() => {
    onStateChange(index, { tmpLithologies, tmpLithologicalDescriptions, hasErrors });
  }, [index, tmpLithologies, tmpLithologicalDescriptions, hasErrors, onStateChange]);

  const hasUnsetDepths = tmpLithologicalDescriptions.some(d => d.fromDepth === null || d.toDepth === null);

  return (
    <Stack gap={2} sx={{ display: visible ? "flex" : "none" }}>
      {hasUnsetDepths && <Alert severity="error">{t("msgDepthsExtractionFailed")}</Alert>}
      <LithologyTable state={state} shownColumns={["lithologicalDescription"]} />
    </Stack>
  );
};
