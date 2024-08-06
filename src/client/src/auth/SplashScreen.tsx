import React from "react";
import { Stack, Typography } from "@mui/material";
import styled from "@mui/material/styles/styled";
import TranslationKeys from "./translationKeys";
import { useTranslation } from "react-i18next";
import { theme } from "../AppTheme.ts";

interface AuthOverlayProps {
  children?: React.ReactNode;
}

export const SplashScreen: React.FC<AuthOverlayProps> = ({ children }) => {
  const { t } = useTranslation();

  const OuterContainer = styled("div")({
    alignItems: "center",
    backgroundColor: theme.palette.background.lightgrey,
    display: "flex",
    flex: "1 1 0%",
    justifyContent: "center",
    height: "100%",
  });

  const InnerContainer = styled("div")({
    backgroundColor: theme.palette.background.default,
    borderRadius: "2px",
    boxShadow: "0 1px 3px " + theme.palette.boxShadow + ", 0 1px 2px " + theme.palette.boxShadow,
    display: "flex",
    flexDirection: "column",
    minWidth: "100px",
    maxWidth: "600px",
  });

  const RowContainer = styled("div")({
    display: "flex",
    flexDirection: "row",
    padding: "1em",
  });

  const StyledImage = styled("img")({
    height: "100px",
    alignSelf: "flex-start",
    paddingBottom: "1em",
  });

  return (
    <OuterContainer>
      <InnerContainer>
        <RowContainer>
          <Stack alignItems="center" direction="column" justifyContent="center" spacing={1.5}>
            <StyledImage sx={{ alignSelf: "left" }} alt="Swiss Logo" src="/swissgeol_boreholes.svg" />
            <Stack>
              <Typography
                sx={{
                  fontSize: "1.2em",
                  alignSelf: "center",
                }}>{`${t("welcomeMessage")} ${window.location.host}`}</Typography>
              <Typography sx={{ fontSize: "0.8em", alignSelf: "center" }}>Borehole Data Management System</Typography>
            </Stack>
            {children}
            <TranslationKeys />
          </Stack>
        </RowContainer>
      </InnerContainer>
    </OuterContainer>
  );
};
