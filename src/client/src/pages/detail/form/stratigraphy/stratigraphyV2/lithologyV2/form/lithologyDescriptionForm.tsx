import { FC, ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormCheckbox, FormContainer, FormInput, FormValueType } from "../../../../../../../components/form/form.ts";
import { Lithology } from "../../../lithology.ts";

interface LithologyDescriptionFormProps {
  lithologyId: number;
  formMethods: UseFormReturn<Lithology>;
  isFirst: boolean;
  hasBedding?: boolean;
  fields: ReactNode[][];
}

export const LithologyDescriptionForm: FC<LithologyDescriptionFormProps> = ({
  lithologyId,
  formMethods,
  isFirst,
  hasBedding,
  fields,
}) => {
  const { getValues, setValue } = formMethods;

  return (
    <FormContainer>
      {fields.map((row, rowIndex) => (
        <FormContainer direction={"row"} key={rowIndex}>
          {rowIndex === 0 && isFirst && hasBedding !== undefined && (
            <FormCheckbox
              fieldName={"hasBedding"}
              label={"bedding"}
              onChange={hasBedding => {
                if (hasBedding) {
                  setValue(`lithologyDescriptions.1`, {
                    id: 0,
                    lithologyId: lithologyId,
                    isFirst: false,
                  });
                } else {
                  setValue("share", undefined);
                  const currentDescriptions = getValues("lithologyDescriptions");
                  const filtered = Array.isArray(currentDescriptions)
                    ? currentDescriptions.filter(d => d.isFirst === true)
                    : [];
                  const result = [filtered[0]];
                  setValue("lithologyDescriptions", result);
                }
              }}
            />
          )}
          {rowIndex === 0 && (
            <FormInput
              fieldName={isFirst ? "share" : "shareInverse"}
              label={"share"}
              type={FormValueType.Number}
              sx={{ flex: "0 0 87px" }}
              disabled={hasBedding === false || !isFirst}
            />
          )}
          {row.map(field => field)}
        </FormContainer>
      ))}
    </FormContainer>
  );
};
