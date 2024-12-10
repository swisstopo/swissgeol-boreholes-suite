import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@mui/material";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormValueType,
} from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface RestrictionSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
}
const restrictionUntilCode = 20111003;

const RestrictionSegment = ({ borehole, editingEnabled, formMethods }: RestrictionSegmentProps) => {
  const [restrictionUntilEnabled, setRestrictionUntilEnabled] = useState<boolean>(
    borehole.restrictionId === restrictionUntilCode,
  );

  const { dirtyFields } = formMethods.formState;
  const restriction = formMethods.watch("restrictionId");

  useEffect(() => {
    //TODO: Adapt data type on backend to Date instead of slicing the returned DateTime
    formMethods.setValue("restrictionUntil", borehole.restrictionUntil?.toString().slice(0, 10) ?? "");
  }, [borehole.restrictionUntil, formMethods]);

  useEffect(() => {
    if (dirtyFields.restrictionId) {
      setRestrictionUntilEnabled(restriction === restrictionUntilCode);
      formMethods.setValue("restrictionUntil", null);
    }
  }, [dirtyFields.restrictionId, formMethods, restriction]);

  return (
    <Card>
      <FormSegmentBox>
        <FormContainer direction="row">
          <FormDomainSelect
            fieldName={"restrictionId"}
            label={"restriction"}
            schemaName={"restriction"}
            readonly={!editingEnabled}
            selected={borehole.restrictionId}
          />
          <FormInput
            fieldName={"restrictionUntil"}
            label="restriction_until"
            disabled={!restrictionUntilEnabled}
            readonly={!editingEnabled || !restrictionUntilEnabled}
            value={borehole.restrictionUntil as Date}
            type={FormValueType.Date}
          />
          <FormBooleanSelect
            canReset={false}
            readonly={!editingEnabled}
            fieldName={"nationalInterest"}
            label="national_interest"
            selected={borehole.nationalInterest}
          />
        </FormContainer>
      </FormSegmentBox>
    </Card>
  );
};

// 2016-06-03T23:15:33.008Z"

export default RestrictionSegment;
