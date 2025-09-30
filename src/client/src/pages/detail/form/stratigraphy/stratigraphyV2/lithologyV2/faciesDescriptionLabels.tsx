import { FC } from "react";
import { Typography } from "@mui/material";
import { useCodelistDisplayValues } from "../../../../../../components/codelist.ts";
import { FaciesDescription } from "../../../../../../api/stratigraphy.ts";

interface FaciesDescriptionLabelsProps {
  description: FaciesDescription;
}

export const FaciesDescriptionLabels: FC<FaciesDescriptionLabelsProps> = ({ description }) => {
  const getCodelistDisplayValues = useCodelistDisplayValues();
  const faciesId = description.facies ? description.facies.id : description.faciesId;
  
  return (
    <>
      <Typography variant="body1" fontWeight={700}>{description.description}</Typography>
      {faciesId && <Typography variant="body2">{getCodelistDisplayValues(faciesId).text}</Typography>}
    </>
  );
};
