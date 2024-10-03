import { FC } from "react";
import { Borehole } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useDomains } from "../../../../api/fetchApiV2";
import { FormContainer } from "../../../../components/form/form.ts";
import { SimpleDomainSelect } from "../../../../components/form/simpleDomainSelect.tsx";
import { SimpleFormInput } from "../../../../components/form/simpleFormInput.tsx";
import { Codelist } from "../../../../components/legacyComponents/domain/domainInterface.ts";
import { parseFloatWithThousandsSeparator } from "../../../../components/legacyComponents/formUtils.js";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import { SegmentProps } from "./segmentInterface.ts";

interface ElevationSegmentProps extends SegmentProps {
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
}
const ElevationSegment: FC<ElevationSegmentProps> = ({ borehole, updateChange, updateNumber, editingEnabled }) => {
  const { data: domains } = useDomains();

  return (
    <FormSegmentBox>
      <FormContainer>
        <FormContainer direction="row">
          <SimpleFormInput
            label={"elevation_z"}
            value={borehole?.data?.elevation_z || ""}
            withThousandSeparator={true}
            readonly={!editingEnabled}
            onUpdate={e => updateNumber("elevation_z", e === "" ? null : parseFloatWithThousandsSeparator(e))}
          />
          <SimpleDomainSelect
            fieldName={"elevation_precision"}
            label={"elevation_precision"}
            schemaName={"elevation_precision"}
            readonly={!editingEnabled}
            selected={borehole.data.elevation_precision}
            onUpdate={e => updateChange("elevation_precision", e ?? null, false)}
          />
        </FormContainer>
        <FormContainer direction="row">
          <SimpleFormInput
            label={"reference_elevation"}
            value={borehole?.data?.reference_elevation || ""}
            withThousandSeparator={true}
            readonly={!editingEnabled}
            onUpdate={e => updateNumber("reference_elevation", e === "" ? null : parseFloatWithThousandsSeparator(e))}
          />
          <SimpleDomainSelect
            fieldName={"qt_reference_elevation"}
            label={"reference_elevation_qt"}
            readonly={!editingEnabled}
            schemaName={"elevation_precision"}
            selected={borehole.data.qt_reference_elevation}
            onUpdate={e => updateChange("qt_reference_elevation", e ?? null, false)}
          />
        </FormContainer>
        <FormContainer direction="row">
          <SimpleDomainSelect
            fieldName={"reference_elevation_type"}
            label={"reference_elevation_type"}
            readonly={!editingEnabled}
            schemaName={"reference_elevation_type"}
            selected={borehole.data.reference_elevation_type}
            onUpdate={e => updateChange("reference_elevation_type", e ?? null, false)}
          />
          <SimpleFormInput
            readonly={true}
            label="height_reference_system"
            value={domains?.find((d: Codelist) => d.id === borehole.data.height_reference_system)?.code}
          />
        </FormContainer>
      </FormContainer>
    </FormSegmentBox>
  );
};

export default ElevationSegment;
