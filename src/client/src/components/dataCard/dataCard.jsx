import { forwardRef } from "react";
import { Box, Card, Grid, Stack } from "@mui/material";
import { styled } from "@mui/system";

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
    padding: "0 8px 8px 8px !important",
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
    padding: "16px 12px 16px 22px",
    marginBottom: "8px",
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
      sx={{
        mb: 2,
        marginBottom: 0,
        flex: "0 1 auto",
        marginTop: "15px",
        marginRight: "10px",
      }}>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap="5px">
        {props.children}
      </Stack>
    </Box>
  );
});
