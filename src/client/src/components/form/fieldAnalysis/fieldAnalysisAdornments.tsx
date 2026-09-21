import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Info, RotateCcw } from "lucide-react";
import { theme } from "../../../AppTheme.ts";
import { useCodelistDisplayValues } from "../../codelist.ts";
import { FieldChange, FieldValue } from "./fieldAnalysis.ts";

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

  return (
    <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
      <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
        {label(change.previous)}
      </Typography>
      <Typography variant="body2">{"→"}</Typography>
      <Typography variant="body2">{label(change.next)}</Typography>
    </Stack>
  );
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
    <Tooltip title={<FieldChangeSummary change={change} />} placement="top">
      <Box
        component="span"
        data-cy="field-analysis-info"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: theme.palette.ai.highlightBorder,
          color: theme.palette.warning.main,
        }}>
        <Info size={12} />
      </Box>
    </Tooltip>
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
        sx={{ color: theme.palette.ai.highlightBorder }}
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
