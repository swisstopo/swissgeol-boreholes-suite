import { FC } from "react";
import { Stack, Theme, Typography } from "@mui/material";
import { SystemStyleObject } from "@mui/system";

interface HeaderCellProps {
  label: string;
  sx?: SystemStyleObject<Theme>;
}

export const StratigraphyTableHeaderCell: FC<HeaderCellProps> = ({ label, sx }) => (
  <Stack sx={{ flex: "1", minWidth: 0, justifyContent: "center", paddingX: 2, paddingY: 1, ...sx }}>
    <Typography variant="body2" fontWeight="700">
      {label}
    </Typography>
  </Stack>
);
