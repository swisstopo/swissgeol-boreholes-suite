import { useContext, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@mui/material";
import { restrictionUntilCode } from "../../../../components/codelist.ts";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormValueType,
} from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { EditStateContext } from "../../editStateContext.tsx";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface RestrictionSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
}

const RestrictionSegment = ({ borehole, formMethods }: RestrictionSegmentProps) => {
  const [restrictionUntilEnabled, setRestrictionUntilEnabled] = useState<boolean>(
    borehole.restrictionId === restrictionUntilCode,
  );
  const { editingEnabled } = useContext(EditStateContext);
  const { dirtyFields } = formMethods.formState;
  const restriction = formMethods.watch("restrictionId");

  useEffect(() => {
    formMethods.setValue("restrictionUntil", borehole.restrictionUntil?.toString() ?? "");
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
            selected={borehole.restrictionId}
          />
          <FormInput
            fieldName={"restrictionUntil"}
            label="restriction_until_date"
            disabled={!restrictionUntilEnabled}
            readonly={!editingEnabled || !restrictionUntilEnabled}
            value={borehole.restrictionUntil as Date}
            type={FormValueType.Date}
          />
          <FormBooleanSelect
            canReset={false}
            fieldName={"nationalInterest"}
            label="nationalInterest"
            selected={borehole.nationalInterest}
          />
        </FormContainer>
      </FormSegmentBox>
    </Card>
  );
};

export default RestrictionSegment;
