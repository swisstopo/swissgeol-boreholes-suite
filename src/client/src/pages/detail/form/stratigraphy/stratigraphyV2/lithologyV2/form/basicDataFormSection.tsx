import { FC } from "react";
import { FormContainer, FormSelect } from "../../../../../../../components/form/form.ts";

interface BasicDataFormSectionProps {
  fromDepths: number[];
  toDepths: number[];
}

export const BasicDataFormSection: FC<BasicDataFormSectionProps> = ({ fromDepths, toDepths }) => (
  <FormContainer>
    <FormContainer direction={"row"}>
      {/* TODO: Warn or forward error if change will produce an overlap or gap in the layer stack */}
      <FormSelect
        fieldName={"fromDepth"}
        label={"fromdepth"}
        values={fromDepths.map(d => ({ key: d, name: d.toString() }))}
        required={true}
      />
      <FormSelect
        fieldName={"toDepth"}
        label={"todepth"}
        values={toDepths.map(d => ({ key: d, name: d.toString() }))}
        required={true}
      />
    </FormContainer>
  </FormContainer>
);
