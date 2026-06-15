import { FC } from "react";
import { Typography } from "@mui/material";
import { useCodelistDisplayValues } from "../../../../../components/codelist.ts";
import { FaciesDescription } from "../stratigraphy.ts";

interface FaciesDescriptionLabelsProps {
  description: FaciesDescription;
}

export const FaciesDescriptionLabels: FC<FaciesDescriptionLabelsProps> = ({ description }) => {
  const getCodelistDisplayValues = useCodelistDisplayValues();
  const faciesId = description.facies ? description.facies.id : description.faciesId;

  return (
    <>
      {faciesId && (
        <Typography variant="body1" fontWeight={700}>
          {getCodelistDisplayValues(faciesId).text}
        </Typography>
      )}
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {description.description}
      </Typography>
    </>
  );
};
