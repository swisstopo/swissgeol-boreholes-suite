import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";

export const TypographyWithBottomMargin = styled(Typography)(() => ({
  marginBottom: 6,
}));

export const StackFullWidth = styled(Stack)(() => ({
  width: "100%",
}));

export const StackHalfWidth = styled(Stack)(() => ({
  width: "50%",
}));
