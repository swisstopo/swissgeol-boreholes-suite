import { FC } from "react";
import { FormContainer, FormInput, FormSelect } from "../../../../../../../components/form/form.ts";

interface BasicDataFormSectionProps {
  fromDepths?: number[];
  toDepths?: number[];
  fromDepthField?: string;
  toDepthField?: string;
}

export const BasicDataFormSection: FC<BasicDataFormSectionProps> = ({
  fromDepths,
  toDepths,
  fromDepthField = "fromDepth",
  toDepthField = "toDepth",
}) => (
  <FormContainer>
    <FormContainer direction={"row"}>
      {fromDepths ? (
        <FormSelect
          fieldName={fromDepthField}
          label={"fromdepth"}
          values={fromDepths.map(d => ({ key: d, name: d.toString() }))}
          required={true}
        />
      ) : (
        <FormInput fieldName={fromDepthField} label={"fromdepth"} required={true} />
      )}
      {toDepths ? (
        <FormSelect
          fieldName={toDepthField}
          label={"todepth"}
          values={toDepths.map(d => ({ key: d, name: d.toString() }))}
          required={true}
        />
      ) : (
        <FormInput fieldName={toDepthField} label={"todepth"} required={true} />
      )}
    </FormContainer>
  </FormContainer>
);
