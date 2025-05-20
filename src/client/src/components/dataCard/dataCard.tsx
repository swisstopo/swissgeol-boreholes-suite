import { FC, ReactNode, Ref } from "react";
import { Box, Card, CardProps, Grid, Stack } from "@mui/material";
import { BoxProps, GridProps, styled } from "@mui/system";
import { theme } from "../../AppTheme";

interface DataCardGridProps extends GridProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

interface DataCardProps extends CardProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

interface DataCardBoxProps extends BoxProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DataCardContainer: FC<DataCardGridProps> = ({ children, ...props }) => {
  const StyledTextField = styled(Grid)(() => ({
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
    <StyledTextField container columnSpacing={{ xs: 2 }} rowSpacing={{ xs: 2 }} ref={props.ref} {...props}>
      {children}
    </StyledTextField>
  );
};

export const DataCardItem: FC<DataCardGridProps> = ({ children, ...props }) => {
  const StyledCard = styled(Grid)(() => ({
    padding: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} !important`,
  }));

  return (
    <StyledCard item md={12} lg={12} xl={6} ref={props.ref} {...props}>
      {children}
    </StyledCard>
  );
};

export const DataCard: FC<DataCardProps> = ({ children, ...props }) => {
  const StyledCard = styled(Card)(() => ({
    width: "100%",
    border: "1px solid lightgrey",
    borderRadius: "3px",
    padding: theme.spacing(2),
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  }));

  return (
    <StyledCard ref={props.ref} {...props}>
      {children}
    </StyledCard>
  );
};

export const DataCardButtonContainer: FC<DataCardBoxProps> = ({ children, ...props }) => {
  return (
    <Box
      ref={props.ref}
      {...props}
      sx={{
        flex: "0 1 auto",
        mt: 2,
      }}>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
        {children}
      </Stack>
    </Box>
  );
};
