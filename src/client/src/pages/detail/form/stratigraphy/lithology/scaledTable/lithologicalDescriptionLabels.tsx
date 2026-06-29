import { FC } from "react";
import { Typography } from "@mui/material";
import { LithologicalDescription } from "../../stratigraphy.ts";

interface LithologicalDescriptionLabelsProps {
  description: LithologicalDescription;
}

export const LithologicalDescriptionLabels: FC<LithologicalDescriptionLabelsProps> = ({ description }) => (
  <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: "pre-line" }}>
    {description.description}
  </Typography>
);
