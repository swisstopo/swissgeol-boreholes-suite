import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { LogRun } from "./log.ts";

interface LogTableProps {
  runs: LogRun[];
}

export const LogTable: FC<LogTableProps> = ({ runs }) => {
  const { t } = useTranslation();

  if (runs.length === 0) {
    return <Typography>{t("noLogRun")}</Typography>;
  }

  return <Box sx={{ backgroundColor: "yellow" }}>{`Table with ${runs.length} LOG runs.`}</Box>;
};
