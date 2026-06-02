import { FC } from "react";
import { Stack, SxProps, Typography } from "@mui/material";

interface HeaderCellProps {
  label: string;
  sx?: SxProps;
}

export const StratigraphyTableHeaderCell: FC<HeaderCellProps> = ({ label, sx }) => (
  <Stack sx={{ flex: "1", justifyContent: "center", paddingX: 2, paddingY: 1, ...sx }}>
    <Typography variant="body2" fontWeight="700">
      {label}
    </Typography>
  </Stack>
);
