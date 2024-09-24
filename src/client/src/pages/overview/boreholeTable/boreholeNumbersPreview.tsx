import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { CircularProgress, Typography } from "@mui/material";
import { capitalizeFirstLetter } from "../../../utils.ts";

interface BoreholeNumbersPreviewProps {
  isFetching: boolean;
  boreholeCount: number;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ isFetching, boreholeCount }) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography>{capitalizeFirstLetter(t("boreholes"))}: </Typography>
      {isFetching ? (
        <CircularProgress sx={{ marginLeft: "15px", width: "15px !important", height: "15px !important" }} />
      ) : (
        <Typography>
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
