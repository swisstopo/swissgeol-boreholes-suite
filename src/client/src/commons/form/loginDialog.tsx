import React from "react";
import { Stack, Typography } from "@mui/material";
import styled from "@mui/material/styles/styled";
import { StackFullWidth } from "../../components/baseComponents";

interface LoginDialogProps {
  title?: string;
  body?: string;
  children?: React.ReactNode;
}

const StyledImage = styled("img")({
  height: "100px",
  alignSelf: "flex-start",
  paddingBottom: "1em",
});

const LoginDialog: React.FC<LoginDialogProps> = ({ title = "Welcome to " + window.location.host, children }) => {
  return (
    <Stack alignItems="left" direction="column">
      <StyledImage alt="Swiss Logo" src="/swissgeol_boreholes.svg" />
      <Typography sx={{ fontSize: "1.2em", alignSelf: "center" }}>{title}</Typography>
      <Typography sx={{ fontSize: "0.8em", alignSelf: "center" }}>Borehole Data Management System</Typography>
      <Stack direction="row">
        <StackFullWidth>{children}</StackFullWidth>
      </Stack>
    </Stack>
  );
};

export default LoginDialog;
