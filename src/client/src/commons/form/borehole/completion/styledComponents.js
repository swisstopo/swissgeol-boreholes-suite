import React, { forwardRef } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Typography,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";

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
    marginTop: "10px !important",
    marginRight: "10px !important",
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

export const IconButtonWithMargin = styled(IconButton)({
  color: "rgba(0, 0, 0, 0.8)",
  marginLeft: "5px",
  "&:hover, &.Mui-focusVisible, &:active, &:focus, &:focus-visible": {
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
});

export const BdmsButton = styled(Button)({
  fontFamily: "Lato",
  textTransform: "none",
  color: "rgba(0, 0, 0, 0.8)",
  borderColor: "rgba(0, 0, 0, 0.8)",
  marginBottom: "6px",
  "&:hover, &.Mui-focusVisible, &:active, &:focus, &:focus-visible": {
    borderColor: "rgba(0, 0, 0, 0.8)",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
});

export const AddButton = forwardRef((props, ref) => {
  return (
    <BdmsButton ref={ref} {...props} variant="outlined" startIcon={<AddIcon />}>
      {props.children}
    </BdmsButton>
  );
});

export const CompletionBox = styled(Box)(() => ({
  backgroundColor: "rgb(242,242,242)",
  borderRadius: "3px",
  padding: "10px 10px 5px 10px",
  margin: "0 5px 10px 5px",
  display: "flex",
  flexDirection: "column",
  boxShadow:
    "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
}));

export const CompletionTabs = styled(Tabs)({
  margin: "0 4px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

export const CompletionTab = styled(props => <Tab disableRipple {...props} />)(
  () => ({
    color: "rgba(0, 0, 0, 0.6)",
    fontFamily: "Lato",
    fontWeight: "bold",
    textTransform: "none",
    fontSize: "16px",
    "&.Mui-selected": {
      color: "rgba(0, 0, 0, 1) !important",
      backgroundColor: "rgb(242,242,242)",
      borderRadius: "3px",
    },
    "&.Mui-focusVisible": {
      backgroundColor: "rgba(100, 95, 228, 0.32)",
    },
  }),
);

export const CompletionCard = forwardRef((props, ref) => {
  const StyledCard = styled(Card)(() => ({
    width: "100%",
    border: "1px solid lightgrey",
    borderRadius: "3px",
    padding: "12px 12px 16px 12px",
    marginBottom: "8px",
  }));

  return (
    <StyledCard ref={ref} {...props}>
      {props.children}
    </StyledCard>
  );
});
