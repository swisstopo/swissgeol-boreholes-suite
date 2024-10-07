import { useEffect, useState } from "react";
import { Card } from "@mui/material";
import { Borehole } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useAuth } from "../../../../auth/useBdmsAuth.tsx";
import { FormContainer } from "../../../../components/form/form.ts";
import { SimpleFormInput } from "../../../../components/form/simpleFormInput.tsx";
import { FormSegmentBox } from "../../../../components/styledComponents";

interface NameSegmentProps {
  borehole: Borehole;
  updateChange: (key: string, value: string) => void;
  editingEnabled: boolean;
}

const NameSegment = ({ borehole, updateChange, editingEnabled }: NameSegmentProps) => {
  const [alternateName, setAlternateName] = useState("");
  const auth = useAuth();

  useEffect(() => {
    setAlternateName(borehole.data.custom.alternate_name || borehole.data.extended.original_name);
  }, [borehole.data]);

  return (
    <Card>
      <FormSegmentBox>
        <FormContainer>
          <FormContainer direction="row">
            <SimpleFormInput
              label={"alternate_name"}
              readonly={!editingEnabled}
              value={alternateName}
              onUpdate={e => {
                setAlternateName(e);
                updateChange("custom.alternate_name", e);
              }}
            />

            <SimpleFormInput
              label={"project_name"}
              value={borehole?.data?.custom.project_name || ""}
              readonly={!editingEnabled}
              onUpdate={e => {
                updateChange("custom.project_name", e);
              }}
            />
          </FormContainer>
          <FormContainer direction="row">
            {!auth.anonymousModeEnabled && (
              <SimpleFormInput
                label={"original_name"}
                value={borehole?.data?.extended.original_name || ""}
                readonly={!editingEnabled}
                onUpdate={e => {
                  setAlternateName(e);
                  updateChange("extended.original_name", e);
                  updateChange("custom.alternate_name", e);
                }}
              />
            )}
          </FormContainer>
        </FormContainer>
      </FormSegmentBox>
    </Card>
  );
};

export default NameSegment;
