import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@mui/material";
import { useAuth } from "../../../../auth/useBdmsAuth.tsx";
import { FormContainer, FormInput, FormInputDisplayOnly } from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface NameSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
}
const NameSegment = ({ borehole, formMethods }: NameSegmentProps) => {
  const auth = useAuth();
  const originalName = formMethods.watch("originalName");
  const alternateName = formMethods.watch("name");
  const { defaultValues } = formMethods.formState;
  const [shouldSyncNames, setShouldSyncNames] = useState(true);

  const defaultNamesEqual = defaultValues?.originalName === defaultValues?.name;
  useEffect(() => {
    setShouldSyncNames(defaultNamesEqual || defaultValues?.name === "");
  }, [defaultNamesEqual, defaultValues?.name]);

  useEffect(() => {
    if (alternateName !== formMethods.getValues("originalName")) {
      setShouldSyncNames(false);
    }
  }, [alternateName, formMethods]);

  useEffect(() => {
    if (shouldSyncNames) {
      formMethods.setValue("name", originalName);
    }
  }, [originalName, formMethods, shouldSyncNames]);

  return (
    <Card>
      <FormSegmentBox>
        <FormContainer>
          {!auth.anonymousModeEnabled && (
            <FormContainer direction="row">
              <FormInput fieldName={"originalName"} label={"original_name"} value={borehole?.originalName} />
              <FormInputDisplayOnly label={"workgroup"} value={borehole?.workgroup?.name} />
            </FormContainer>
          )}
          <FormContainer direction="row">
            <FormInput fieldName={"name"} label={"alternate_name"} value={borehole?.name} />
            <FormInput fieldName={"projectName"} label={"project_name"} value={borehole?.projectName} />
          </FormContainer>
        </FormContainer>
      </FormSegmentBox>
    </Card>
  );
};

export default NameSegment;
