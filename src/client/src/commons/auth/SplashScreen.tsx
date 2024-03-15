import React from "react";
import { Stack, Typography } from "@mui/material";
import styled from "@mui/material/styles/styled";
import TranslationKeys from "../translationKeys";

interface AuthOverlayProps {
    title?: string;
    children?: React.ReactNode;
}

export const SplashScreen: React.FC<AuthOverlayProps> = ({ children, title = "Welcome to " + window.location.host, }) => {
    const OuterContainer = styled("div")({
        alignItems: "center",
        backgroundColor: "#787878",
        display: "flex",
        flex: "1 1 0%",
        justifyContent: "center",
        height: "100%",
    });

    const InnerContainer = styled("div")({
        backgroundColor: "#fff",
        borderRadius: "2px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
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
                    <Stack alignItems="center" direction="column" justifyContent="center" spacing={ 1.5 }>
                        <StyledImage sx={{ alignSelf: "left" }} alt="Swiss Logo" src="/swissgeol_boreholes.svg" />
                        <Stack>
                            <Typography sx={{ fontSize: "1.2em", alignSelf: "center" }}>{title}</Typography>
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
