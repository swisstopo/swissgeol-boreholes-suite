import { FC } from "react";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../../../../components/form/form.ts";

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
      {/* TODO: Warn or forward error if change will produce an overlap or gap in the layer stack */}
      {fromDepths ? (
        <FormSelect
          fieldName={fromDepthField}
          label={"fromdepth"}
          values={fromDepths.map(d => ({ key: d, name: d.toString() }))}
          required={true}
        />
      ) : (
        <FormInput fieldName={fromDepthField} label={"fromdepth"} required={true} type={FormValueType.Number} />
      )}
      {toDepths ? (
        <FormSelect
          fieldName={toDepthField}
          label={"todepth"}
          values={toDepths.map(d => ({ key: d, name: d.toString() }))}
          required={true}
        />
      ) : (
        <FormInput fieldName={toDepthField} label={"todepth"} required={true} type={FormValueType.Number} />
      )}
    </FormContainer>
  </FormContainer>
);
