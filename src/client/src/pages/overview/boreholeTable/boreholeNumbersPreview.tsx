import { NumericFormat } from "react-number-format";
import { FC } from "react";
import { CircularProgress } from "@mui/material";
import TranslationText from "../../../components/legacyComponents/translationText";

interface BoreholeNumbersPreviewProps {
  isFetching: boolean;
  boreholeCount: number;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ isFetching, boreholeCount }) => {
  return (
    <>
      <TranslationText firstUpperCase id="boreholes" />:{" "}
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
