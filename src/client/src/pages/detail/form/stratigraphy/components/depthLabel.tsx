import { FC } from "react";
import { Typography } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { formatNumberForDisplay } from "../../../../../components/form/formUtils.ts";

interface DepthLabelProps {
  value: number | null;
  position?: "first" | "last" | "default";
  dataCy?: string;
}

const getPositionStyles = (position: "first" | "last" | "default") => {
  switch (position) {
    case "first":
      return { top: theme.spacing(2), transform: "translateX(-50%)" };
    case "last":
      return { bottom: theme.spacing(2), transform: "translateX(-50%)" };
    default:
      return { bottom: 0, transform: "translate(-50%, 50%)" };
  }
};

export const DepthLabel: FC<DepthLabelProps> = ({ value, position = "default", dataCy }) => {
  return (
    <Typography
      data-cy={dataCy}
      sx={{
        position: "absolute",
        left: "50%",
        whiteSpace: "nowrap",
        backgroundColor: theme.palette.background.default,
        padding: `0 ${theme.spacing(1)}`,
        ...getPositionStyles(position),
      }}>
      {formatNumberForDisplay(value)}
    </Typography>
  );
};
