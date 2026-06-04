import { FC } from "react";
import { NumericFormat } from "react-number-format";
import { Typography } from "@mui/material";
import { useCapitalizedTranslation } from "../../../hooks/useCapitalizedTranslation.ts";

interface BoreholeNumbersPreviewProps {
  boreholeCount: number;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ boreholeCount }) => {
  const ct = useCapitalizedTranslation();
  return (
    <>
      <Typography variant="body2">{ct("boreholes")}: </Typography>
      <Typography variant="body2">
        <NumericFormat
          data-cy="boreholes-number-preview"
          value={boreholeCount}
          thousandSeparator="'"
          displayType="text"
          style={{ marginLeft: "0.5em" }}
        />
      </Typography>
    </>
  );
};
