import { FC } from "react";
import { Stack, Typography } from "@mui/material";

interface ValueChangeProps {
  previous: string;
  next: string;
}

/** A replaced value: the previous one struck through, then the new one. */
export const ValueChange: FC<ValueChangeProps> = ({ previous, next }) => (
  <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
    <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
      {previous}
    </Typography>
    <Typography variant="body2">{"→"}</Typography>
    <Typography variant="body2">{next}</Typography>
  </Stack>
);
