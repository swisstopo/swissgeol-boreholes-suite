import { Box, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../AppTheme";

export const FullPage = styled(Stack)({
  flex: "1 0 0",
});

export const FullPageCentered = styled(Stack)({
  flex: "1 0 0",
  justifyContent: "center",
  alignItems: "center",
});

export const StackFullWidth = styled(Stack)(() => ({
  width: "100%",
}));

export const StackHalfWidth = styled(Stack)(() => ({
  width: "50%",
}));

export const TypographyWithBottomMargin = styled(Typography)(() => ({
  marginBottom: "1em",
}));

export const AppBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

export const LayoutBox = styled(Box)({ flex: "1 1 100%", display: "flex", flexDirection: "row", overflow: "hidden" });

export const SidebarBox = styled(Box)(() => ({
  flexShrink: 0,
  borderRight: "1px solid " + theme.palette.boxShadow,
  position: "relative",
}));

export const MainContentBox = styled(Box)({
  flex: "1 1 0%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
});
