import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { theme } from "../../../../../AppTheme";
import { labelingButtonStyles } from "../../../labeling/labelingStyles.ts";

export const PagesBadge = ({ currentPageRange }: { currentPageRange?: number[] }) => {
  const { t } = useTranslation();
  const pageRangeText =
    currentPageRange && currentPageRange.length > 1
      ? t("pageRange", { start: currentPageRange[0], end: currentPageRange[currentPageRange.length - 1] })
      : null;

  return (
    <Stack
      m={2}
      p={2}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{
        visibility: pageRangeText ? "visible" : "hidden",
        width: "fit-content",
        zIndex: 500,
        ...labelingButtonStyles,
        backgroundColor: theme.palette.border.darker,
        borderRadius: "4px",
        border: `1px solid ${theme.palette.border.dark}`,
      }}>
      {pageRangeText}
    </Stack>
  );
};
