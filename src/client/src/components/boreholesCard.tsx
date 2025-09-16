import { FC, ReactNode } from "react";
import { Card, CardContent, CardHeader, SxProps } from "@mui/material";
import { theme } from "../AppTheme.ts";

interface BoreholesCardProps {
  "data-cy"?: string;
  title?: string;
  action?: ReactNode;
  sx?: SxProps;
  children?: ReactNode;
}

export const BoreholesCard: FC<BoreholesCardProps> = ({ "data-cy": dataCy, title, action, sx, children }) => {
  return (
    <Card data-cy={dataCy} sx={{ borderColor: theme.palette.border.darker, ...sx }}>
      {(title || action) && (
        <CardHeader title={title ?? ""} sx={{ p: 4, pb: 3 }} slotProps={{ title: { variant: "h5" } }} action={action} />
      )}
      <CardContent sx={{ pt: 4, px: 3 }}>{children}</CardContent>
    </Card>
  );
};
