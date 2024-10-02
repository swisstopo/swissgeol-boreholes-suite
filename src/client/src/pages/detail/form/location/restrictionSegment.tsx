import { useEffect, useState } from "react";
import { Card } from "@mui/material";
import { FormContainer, FormValueType } from "../../../../components/form/form.ts";
import { SimpleBooleanSelect } from "../../../../components/form/simpleBooleanSelect.tsx";
import { SimpleDomainSelect } from "../../../../components/form/simpleDomainSelect.tsx";
import { SimpleFormInput } from "../../../../components/form/simpleFormInput.tsx";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { SegmentProps } from "./segmentInterface.ts";

const restrictionUntilCode = 20111003;

const RestrictionSegment = ({ borehole, updateChange, editingEnabled }: SegmentProps) => {
  const [restrictionUntilEnabled, setRestrictionUntilEnabled] = useState<boolean>(
    borehole.data.restriction === restrictionUntilCode,
  );

  useEffect(() => {
    if (borehole.data.restriction !== restrictionUntilCode) {
      setRestrictionUntilEnabled(false);
    } else {
      setRestrictionUntilEnabled(true);
    }
  }, [borehole.data.restriction]);

  return (
    <Card>
      <FormSegmentBox>
        <FormContainer direction="row">
          <SimpleDomainSelect
            fieldName={"restriction"}
            label={"restriction"}
            schemaName={"restriction"}
            readonly={!editingEnabled}
            selected={borehole.data.restriction}
            onUpdate={e => {
              if (e !== restrictionUntilCode) {
                setRestrictionUntilEnabled(false);
                updateChange("restriction_until", "", false);
              }
              updateChange("restriction", e ?? null, false);
            }}
          />
          <SimpleFormInput
            label="restriction_until"
            disabled={!restrictionUntilEnabled}
            readonly={!editingEnabled || !restrictionUntilEnabled}
            value={borehole.data.restriction_until}
            type={FormValueType.Date}
            onUpdate={selected => {
              updateChange("restriction_until", selected, false);
            }}
          />
          <SimpleBooleanSelect
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
  );
};

export default RestrictionSegment;
