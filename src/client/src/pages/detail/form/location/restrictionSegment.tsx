import { FormProvider, useForm } from "react-hook-form";
import { Card } from "@mui/material";
import { FormContainer, FormInput, FormValueType } from "../../../../components/form/form.ts";
import { FormBooleanSelect } from "../../../../components/form/formBooleanSelect.tsx";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect.tsx";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { SegmentProps } from "./segmentInterface.ts";

const RestrictionSegment = ({ borehole, updateChange, editingEnabled }: SegmentProps) => {
  const formMethods = useForm({
    mode: "all",
  });

  const restriction = formMethods.watch("restriction");
  const restrictionUntilCode = 20111003;

  return (
    <FormProvider {...formMethods}>
      <Card>
        <FormSegmentBox>
          <FormContainer direction="row">
            <FormDomainSelect
              fieldName={"restriction"}
              label={"restriction"}
              schemaName={"restriction"}
              readonly={!editingEnabled}
              selected={borehole.data.restriction}
              onUpdate={e => {
                if (e !== restrictionUntilCode) {
                  formMethods.setValue("restriction_until", null);
                }
                updateChange("restriction", e ?? null, false);
              }}
            />
            <FormInput
              fieldName="restriction_until"
              label="restriction_until"
              disabled={restriction !== restrictionUntilCode}
              readonly={!editingEnabled || restriction !== restrictionUntilCode}
              value={borehole.data.restriction_until}
              type={FormValueType.Date}
              onUpdate={selected => {
                updateChange("restriction_until", selected, false);
              }}
            />
            <FormBooleanSelect
              required
              readonly={!editingEnabled}
              fieldName={"national_interest"}
              label="national_interest"
              selected={borehole.data.national_interest}
              onUpdate={e => {
                updateChange("national_interest", e, false);
              }}
            />
          </FormContainer>
        </FormSegmentBox>
      </Card>
    </FormProvider>
  );
};

export default RestrictionSegment;
