import { forwardRef } from "react";
import { Box, Card, Grid, Stack } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../../AppTheme";

export const DataCardContainer = forwardRef((props, ref) => {
  const StyledTextField = styled(Grid)(() => ({
    flex: "1 0 0",
    alignContent: "flex-start",
    width: "100% !important",
    borderWidth: "1px",
    borderColor: "black",
    padding: "0",
    marginBottom: "10px",
    marginTop: "10px !important",
    marginLeft: "0 !important",
    overflow: "auto",
  }));

  return (
    <StyledTextField container columnSpacing={{ xs: 2 }} rowSpacing={{ xs: 2 }} ref={ref} {...props}>
      {props.children}
    </StyledTextField>
  );
});

export const DataCardItem = forwardRef((props, ref) => {
  const StyledCard = styled(Grid)(() => ({
    padding: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} !important`,
  }));

  return (
    <StyledCard item md={12} lg={12} xl={6} ref={ref} {...props}>
      {props.children}
    </StyledCard>
  );
});

export const DataCard = forwardRef((props, ref) => {
  const StyledCard = styled(Card)(() => ({
    width: "100%",
    border: "1px solid lightgrey",
    borderRadius: "3px",
    padding: theme.spacing(2),
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  }));

  return (
    <StyledCard ref={ref} {...props}>
      {props.children}
    </StyledCard>
  );
});

export const DataCardButtonContainer = forwardRef((props, ref) => {
  return (
    <Box
      ref={ref}
      {...props}
      sx={{
        flex: "0 1 auto",
        mt: 2,
      }}>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
        {props.children}
      </Stack>
    </Box>
  );
});
