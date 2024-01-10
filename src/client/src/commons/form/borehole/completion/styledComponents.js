import React, { forwardRef } from "react";
import { Stack, Typography, TextField } from "@mui/material";
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

export const TextfieldWithMarginRight = forwardRef((props, ref) => {
  const StyledTextField = styled(TextField)(() => ({
    flex: "1",
    marginTop: "10px",
    marginRight: "10px",
  }));

  return (
    <StyledTextField ref={ref} {...props}>
      {props.children}
    </StyledTextField>
  );
});

export const TextfieldNoMargin = forwardRef((props, ref) => {
  // the ref and children needs to be manually forwarded with custom components, the native TextField component would handle the forwarding internally.
  const StyledTextField = styled(TextField)(() => ({
    flex: "1",
    marginTop: "10px",
  }));

  return (
    <StyledTextField ref={ref} {...props}>
      {props.children}
    </StyledTextField>
  );
});
