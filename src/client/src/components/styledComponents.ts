import { Box, Stack } from "@mui/material";
import ListItem from "@mui/material/ListItem";
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

export const DialogHeaderContainer = styled(Box)({
  borderBottom: "1px solid " + theme.palette.border.light,
  paddingTop: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  paddingBottom: theme.spacing(2),
});

export const DialogMainContent = styled(Box)({
  padding: theme.spacing(3),
  flexGrow: 1,
});

export const DialogFooterContainer = styled(Box)({
  borderTop: "1px solid " + theme.palette.border.light,
  padding: theme.spacing(3),
});

export const DetailHeaderStack = styled(Stack)({
  borderBottom: "1px solid " + theme.palette.border.light,
  padding: "24px",
  minHeight: "89px",
});

interface ParentListItemProps {
  active: boolean;
  hasContent?: boolean;
}

export const ParentListItem = styled(ListItem)<ParentListItemProps>(({ active, hasContent }) => {
  let textColor = "inherit";
  if (!hasContent) {
    textColor = theme.palette.buttonStates.outlined.disabled.color;
  } else if (active) {
    textColor = theme.palette.error.main;
  }

  return {
    padding: "1em",
    display: "flex",
    height: "40px",
    cursor: "pointer",
    paddingLeft: "35.5px",
    color: textColor,
    borderTop: `1px solid ${theme.palette.border.light}`,
    borderLeft: active ? `0.25em solid ${theme.palette.error.main}` : "none",
    backgroundColor: active ? theme.palette.background.lightgrey : "transparent",
    "&:hover": {
      backgroundColor: theme.palette.hover.main,
    },
  };
});

export const ChildListItem = styled(ParentListItem)(() => ({
  paddingLeft: "50px !important",
}));
