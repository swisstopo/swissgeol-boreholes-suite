import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { Typography } from "@mui/material";
import { capitalizeFirstLetter } from "../../../utils.ts";

interface BoreholeNumbersPreviewProps {
  boreholeCount: number;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ boreholeCount }) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="body2">{capitalizeFirstLetter(t("boreholes"))}: </Typography>
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
