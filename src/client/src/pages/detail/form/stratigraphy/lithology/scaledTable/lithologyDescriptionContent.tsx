import { FC } from "react";
import { Typography } from "@mui/material";
import { LithologicalDescription } from "../../stratigraphy.ts";

interface LithologyDescriptionContentProps {
  description: LithologicalDescription;
}

export const LithologyDescriptionContent: FC<LithologyDescriptionContentProps> = ({ description }) => (
  <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: "pre-line" }}>
    {description.description}
  </Typography>
);
