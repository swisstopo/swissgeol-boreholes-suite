import { FC } from "react";
import { FormContainer, FormInput } from "../../../../../../../components/form/form.ts";

interface RemarksFormSectionProps {
  fieldName?: string;
  label?: string;
  rows?: number;
}

export const RemarksFormSection: FC<RemarksFormSectionProps> = ({
  fieldName = "remarks",
  label = "remarks",
  rows = 3,
}) => (
  <FormContainer direction={"row"}>
    <FormInput fieldName={fieldName} label={label} multiline={true} rows={rows} />
  </FormContainer>
);
