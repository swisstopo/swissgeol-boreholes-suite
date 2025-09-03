import { FC, ReactNode } from "react";
import { Box, IconButton, Stack, SxProps, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";

interface HeaderRowContainerProps {
  children: ReactNode;
  gridTemplateColumns: string;
  sx?: SxProps;
}

export const HeaderRowContainer: FC<HeaderRowContainerProps> = ({ children, gridTemplateColumns, sx }) => (
  <Box
    sx={{
      gridColumn: "1 / -1",
      display: "grid",
      gridTemplateColumns,
      borderTopLeftRadius: theme.spacing(0.5),
      borderTopRightRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.listItemActive,
      borderBottom: `2px solid ${theme.palette.border.darker}`,
      boxShadow: theme.shadows[3],
      ...sx,
    }}>
    {children}
  </Box>
);

interface HeaderCellProps {
  children: ReactNode;
  sx?: SxProps;
}

export const HeaderCell: FC<HeaderCellProps> = ({ children, sx }) => (
  <Stack sx={{ justifyContent: "center", paddingX: 2, paddingY: 1, ...sx }}>
    <Typography variant="body2" fontWeight="700">
      {children}
    </Typography>
  </Stack>
);

interface DataCellProps {
  children: ReactNode;
  sx?: object;
  isLastColumn?: boolean;
}

export const DataCell: FC<DataCellProps> = ({ children, sx, isLastColumn }) => (
  <Stack
    sx={{
      padding: 2,
      borderLeft: `1px solid ${theme.palette.border.darker}`,
      borderRight: isLastColumn ? `1px solid ${theme.palette.border.darker}` : undefined,
      borderBottom: `1px solid ${theme.palette.border.darker}`,
      ...sx,
    }}>
    {children}
  </Stack>
);

export const AddButton = () => (
  <IconButton
    sx={{
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      width: 36,
      height: 36,
      "&:hover": {
        backgroundColor: theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor,
      },
    }}>
    <Plus />
  </IconButton>
);

export const AddRowButton = () => {
  const dashedOutlineImage = `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23C6D3DA' stroke-width='1' stroke-dasharray='9%2C9' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`;
  const dashedOutlineImageHover = `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23ACB4BD' stroke-width='1' stroke-dasharray='9%2C9' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`;

  return (
    <Stack
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        padding: 1.5,
        borderRadius: "8px",
        backgroundImage: dashedOutlineImage,
        "&:hover": {
          backgroundImage: dashedOutlineImageHover,
          cursor: "pointer",
          "& .MuiIconButton-root": {
            backgroundColor: theme.palette.buttonStates.contained.hoverOrFocus.backgroundColor,
          },
        },
      }}>
      <AddButton />
    </Stack>
  );
};
