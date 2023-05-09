import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";

export const TypographyWithBottomMargin = styled(Typography)(() => ({
  marginBottom: "1em",
}));

export const StackFullWidth = styled(Stack)(() => ({
  width: "100%",
}));

export const StackHalfWidth = styled(Stack)(() => ({
  width: "50%",
}));
