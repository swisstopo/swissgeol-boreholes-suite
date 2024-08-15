import { NumericFormat } from "react-number-format";
import { FC } from "react";
import { CircularProgress } from "@mui/material";
import { capitalizeFirstLetter } from "../../../utils.ts";
import { useTranslation } from "react-i18next";

interface BoreholeNumbersPreviewProps {
  isFetching: boolean;
  boreholeCount: number;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ isFetching, boreholeCount }) => {
  const { t } = useTranslation();
  return (
    <>
      {capitalizeFirstLetter(t("boreholes"))}:{" "}
      {isFetching ? (
        <CircularProgress sx={{ marginLeft: "15px", width: "15px !important", height: "15px !important" }} />
      ) : (
        <NumericFormat
          data-cy="boreholes-number-preview"
          value={boreholeCount}
          thousandSeparator="'"
          displayType="text"
          style={{ marginLeft: "0.5em" }}
        />
      )}
    </>
  );
};
