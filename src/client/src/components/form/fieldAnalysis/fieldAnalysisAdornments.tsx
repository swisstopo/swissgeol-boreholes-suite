import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Stack, Tooltip } from "@mui/material";
import { RotateCcw } from "lucide-react";
import { useCodelistDisplayValues } from "../../codelist.ts";
import { AnalysisBadge } from "./analysisBadge.tsx";
import { FieldChange, FieldValue } from "./fieldAnalysis.ts";
import { ValueChange } from "./valueChange.tsx";

interface FieldChangeSummaryProps {
  change: FieldChange;
}

/** The change one analysis made to one field: the previous value struck through, then the new one. */
export const FieldChangeSummary: FC<FieldChangeSummaryProps> = ({ change }) => {
  const { t } = useTranslation();
  const displayValues = useCodelistDisplayValues();

  const label = (value: FieldValue): string => {
    const ids = toIdList(value);
    if (ids.length === 0) return t("emptyValueMarker");
    return ids.map(id => displayValues(id).text).join(", ");
  };

  return <ValueChange previous={label(change.previous)} next={label(change.next)} />;
};

const toIdList = (value: FieldValue): number[] => {
  if (Array.isArray(value)) return value;
  if (value === null) return [];
  return [value];
};

interface FieldAnalysisLabelProps {
  label: ReactNode;
  change: FieldChange;
}

/** A field label plus the badge whose tooltip shows what the analysis changed. */
export const FieldAnalysisLabel: FC<FieldAnalysisLabelProps> = ({ label, change }) => (
  <Stack direction="row" gap={0.5} alignItems="center" component="span">
    {label}
    {label && (
      <Tooltip title={<FieldChangeSummary change={change} />} placement="top">
        <AnalysisBadge data-cy="field-analysis-info" />
      </Tooltip>
    )}
  </Stack>
);

interface FieldAnalysisResetButtonProps {
  fieldName: string;
  onReset: () => void;
}

/** Resets one automatically written field back to the value it had before the analysis. */
export const FieldAnalysisResetButton: FC<FieldAnalysisResetButtonProps> = ({ fieldName, onReset }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("reset")}>
      <IconButton
        size="small"
        data-cy={`${fieldName}-analysis-reset`}
        onClick={event => {
          // The button sits inside the Autocomplete's adornment, which would otherwise open the list.
          event.preventDefault();
          event.stopPropagation();
          onReset();
        }}>
        <RotateCcw size={16} />
      </IconButton>
    </Tooltip>
  );
};
