import { FC } from "react";
import { NumericFormat } from "react-number-format";
import { CircularProgress, Typography } from "@mui/material";
import { useCapitalizedTranslation } from "../../../hooks/useCapitalizedTranslation.ts";

interface BoreholeNumbersPreviewProps {
  boreholeCount: number;
  isLoading: boolean;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ boreholeCount, isLoading }) => {
  const ct = useCapitalizedTranslation();
  return (
    <>
      <Typography variant="body2">{ct("boreholes")}: </Typography>
      {isLoading ? (
        <CircularProgress size={16} sx={{ ml: "0.5em" }} />
      ) : (
        <Typography variant="body2">
          <NumericFormat
            data-cy="boreholes-number-preview"
            value={boreholeCount}
            thousandSeparator="'"
            displayType="text"
            style={{ marginLeft: "0.5em" }}
          />
        </Typography>
      )}
    </>
  );
};
