import { Box, Stack } from "@mui/material";
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

export const FullPageAlignLeft = styled(Stack)({
  flex: "1 0 0",
  justifyContent: "center",
  alignItems: "flex-start",
});

export const StackFullWidth = styled(Stack)(() => ({
  width: "100%",
}));

export const StackHalfWidth = styled(Stack)(() => ({
  width: "50%",
}));

export const AppBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

export const LayoutBox = styled(Box)({ flex: "1 1 100%", display: "flex", flexDirection: "row", overflow: "hidden" });

export const SidebarBox = styled(Box)(() => ({
  flexShrink: 0,
  borderRight: "1px solid " + theme.palette.border.light,
  position: "relative",
}));

export const MainContentBox = styled(Box)({
  flex: "1 1 0%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
});

export const FormSegmentBox = styled(Box)({
  padding: theme.spacing(3),
});

export const DialogHeaderContainer = styled(Stack)({
  borderBottom: "1px solid " + theme.palette.border.light,
  paddingTop: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  flex: 0,
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
});

export const DialogMainContent = styled(Box)({
  padding: theme.spacing(3),
  flex: "1 1 0%",
  overflow: "auto",
});

export const DialogFooterContainer = styled(Stack)({
  borderTop: "1px solid " + theme.palette.border.light,
  padding: theme.spacing(3),
  flex: 0,
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: theme.spacing(0.75),
});

export const DetailHeaderStack = styled(Stack)({
  borderBottom: "1px solid " + theme.palette.border.light,
  padding: "24px",
  minHeight: "89px",
});
