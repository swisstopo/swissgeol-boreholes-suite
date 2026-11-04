import { useContext, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Box, Card } from "@mui/material";
import { restrictionUntilCode } from "../../../../components/codelist.ts";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainMultiSelect,
  FormDomainSelect,
  FormInput,
  FormValueType,
} from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { EditStateContext } from "../../editStateContext.tsx";
import { BoreholeFormInputs } from "../borehole/boreholePanelInterfaces.ts";
import { LocationBaseProps } from "./locationPanelInterfaces.tsx";

interface RestrictionSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<BoreholeFormInputs>;
}

const RestrictionSegment = ({ borehole, formMethods }: RestrictionSegmentProps) => {
  const { editingEnabled } = useContext(EditStateContext);
  const restriction = formMethods.watch("restrictionId");
  const restrictionUntilEnabled = restriction === restrictionUntilCode;

  useEffect(() => {
    formMethods.setValue("restrictionUntil", borehole.restrictionUntil?.toString() ?? "");
  }, [borehole.restrictionUntil, formMethods]);

  // A date only applies to the restriction it was entered for.
  const clearRestrictionUntil = () => {
    formMethods.setValue("restrictionUntil", null);
  };

  return (
    <Card>
      <FormSegmentBox>
        <FormContainer>
          <FormContainer direction="row">
            <FormDomainSelect
              fieldName={"restrictionId"}
              label={"restriction"}
              schemaName={"restriction"}
              selected={borehole.restrictionId}
              onUpdate={clearRestrictionUntil}
            />
            <FormInput
              fieldName={"restrictionUntil"}
              label="restrictionUntilDate"
              disabled={!restrictionUntilEnabled}
              readonly={!editingEnabled || !restrictionUntilEnabled}
              value={borehole.restrictionUntil}
              type={FormValueType.Date}
            />
            <FormBooleanSelect
              canReset={false}
              fieldName={"nationalInterest"}
              label="nationalInterest"
              selected={borehole.nationalInterest}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormBooleanSelect
              canReset={false}
              fieldName={"coreRepositoryStored"}
              label="coreRepositoryStored"
              selected={borehole.coreRepositoryStored}
            />
            <FormDomainMultiSelect
              fieldName={"sourceTypeCodelistIds"}
              label="sourceType"
              schemaName={"source_type"}
              selected={borehole.sourceTypeCodelistIds ?? []}
            />
            <Box sx={{ flex: 1 }} />
          </FormContainer>
        </FormContainer>
      </FormSegmentBox>
    </Card>
  );
};

export default RestrictionSegment;
