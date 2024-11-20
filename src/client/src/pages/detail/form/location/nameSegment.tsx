import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, TextField } from "@mui/material";
import { t } from "i18next";
import { useAuth } from "../../../../auth/useBdmsAuth.tsx";
import { FormContainer, FormInput } from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface NameSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
}
const NameSegment = ({ borehole, editingEnabled, formMethods }: NameSegmentProps) => {
  const auth = useAuth();
  const originalName = formMethods.watch("originalName");
  const { dirtyFields, isDirty } = formMethods.formState;

  useEffect(() => {
    if (dirtyFields.originalName || (!isDirty && formMethods.getValues("alternateName") === "")) {
      formMethods.setValue("alternateName", originalName);
    }
  }, [borehole?.alternateName, dirtyFields.originalName, formMethods, formMethods.setValue, isDirty, originalName]);

  return (
    <Card>
      <FormSegmentBox>
        <FormContainer>
          <FormContainer direction="row">
            <FormInput
              fieldName={"alternateName"}
              label={"alternate_name"}
              readonly={!editingEnabled}
              value={borehole?.alternateName || ""}
            />
            <FormInput
              fieldName={"projectName"}
              label={"project_name"}
              value={borehole?.projectName || ""}
              readonly={!editingEnabled}
            />
          </FormContainer>
          <FormContainer direction="row">
            {!auth.anonymousModeEnabled && (
              <FormInput
                fieldName={"originalName"}
                label={"original_name"}
                value={borehole?.originalName || ""}
                readonly={!editingEnabled}
              />
            )}
            <TextField
              InputProps={{
                readOnly: true,
              }}
              className="readonly"
              label={t("workgroup")}
              value={borehole?.workgroup?.name || ""}
            />
          </FormContainer>
        </FormContainer>
      </FormSegmentBox>
    </Card>
  );
};

export default NameSegment;
