import { FC } from "react";
import { FormContainer, FormSelect } from "../../../../../../components/form/form.ts";
import { formatNumberForDisplay } from "../../../../../../components/form/formUtils.ts";

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
        values={fromDepths.map(d => ({ key: d, name: formatNumberForDisplay(d) }))}
        required={true}
      />
      <FormSelect
        fieldName={"toDepth"}
        label={"todepth"}
        values={toDepths.map(d => ({ key: d, name: formatNumberForDisplay(d) }))}
        required={true}
      />
    </FormContainer>
  </FormContainer>
);
