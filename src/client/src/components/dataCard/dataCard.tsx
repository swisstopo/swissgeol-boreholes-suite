import { FC, ReactNode, Ref } from "react";
import { Box, Card, CardProps, Grid2, Grid2Props, Stack } from "@mui/material";
import { BoxProps, styled } from "@mui/system";
import { theme } from "../../AppTheme";

interface DataCardGridProps extends Grid2Props {
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

const StyledDataCardContainer = styled(Grid2)(() => ({
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

const StyledDataCardItem = styled(Grid2)(() => ({
  padding: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} !important`,
}));

const StyledDataCard = styled(Card)(() => ({
  width: "100%",
  border: "1px solid lightgrey",
  borderRadius: "3px",
  padding: theme.spacing(2),
  paddingTop: theme.spacing(3),
  marginBottom: theme.spacing(1),
}));

export const DataCardContainer: FC<DataCardGridProps> = ({ children, ref, ...props }) => {
  return (
    <StyledDataCardContainer container columnSpacing={{ xs: 2 }} rowSpacing={{ xs: 2 }} ref={ref} {...props}>
      {children}
    </StyledDataCardContainer>
  );
};

export const DataCardItem: FC<DataCardGridProps> = ({ children, ref, ...props }) => {
  return (
    <StyledDataCardItem size={{ md: 12, lg: 12, xl: 6 }} ref={ref} {...props}>
      {children}
    </StyledDataCardItem>
  );
};

export const DataCard: FC<DataCardProps> = ({ children, ref, ...props }) => {
  return (
    <StyledDataCard ref={ref} {...props}>
      {children}
    </StyledDataCard>
  );
};

export const DataCardButtonContainer: FC<DataCardBoxProps> = ({ children, ref, ...props }) => {
  return (
    <Box
      ref={ref}
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
