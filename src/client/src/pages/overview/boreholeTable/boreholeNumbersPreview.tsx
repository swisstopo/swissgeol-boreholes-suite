import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { CircularProgress, Typography } from "@mui/material";
import { useCapitalizedTranslation } from "../../../hooks/useCapitalizedTranslation.ts";

/**
 * Whether the overview has a borehole count to show. "failed" means the request failed and no earlier result is
 * left, so the count would otherwise read 0.
 */
export type BoreholeCountState = "loading" | "failed" | "loaded";

interface BoreholeNumbersPreviewProps {
  boreholeCount: number;
  countState: BoreholeCountState;
}

export const BoreholeNumbersPreview: FC<BoreholeNumbersPreviewProps> = ({ boreholeCount, countState }) => {
  const { t } = useTranslation();
  const ct = useCapitalizedTranslation();
  return (
    <>
      <Typography variant="body2">{ct("boreholes")}: </Typography>
      {countState === "loading" && (
        <CircularProgress size={16} sx={{ ml: "0.5em" }} aria-label={t("boreholeCountLoading")} />
      )}
      {countState === "failed" && (
        <Typography variant="body2" sx={{ ml: "0.5em" }} data-cy="boreholes-number-preview-failed">
          {t("boreholeCountNotLoaded")}
        </Typography>
      )}
      {countState === "loaded" && (
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
