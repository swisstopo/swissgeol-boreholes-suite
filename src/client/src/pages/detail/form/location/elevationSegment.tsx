import { FC } from "react";
import { BoreholeV2 } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useDomains } from "../../../../api/fetchApiV2";
import { FormContainer, FormDomainSelect, FormInput } from "../../../../components/form/form.ts";
import { Codelist } from "../../../../components/legacyComponents/domain/domainInterface.ts";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";

interface ElevationSegmentProps {
  borehole: BoreholeV2;
  editingEnabled: boolean;
}
const ElevationSegment: FC<ElevationSegmentProps> = ({ borehole, editingEnabled }) => {
  const { data: domains } = useDomains();

  return (
    <FormSegmentBox>
      <FormContainer>
        <FormContainer direction="row">
          <FormInput
            fieldName={"elevationZ"}
            label={"elevation_z"}
            value={borehole.elevationZ}
            withThousandSeparator={true}
            readonly={!editingEnabled}
          />
          <FormDomainSelect
            fieldName={"elevationPrecisionId"}
            label={"elevation_precision"}
            schemaName={"elevation_precision"}
            readonly={!editingEnabled}
            selected={borehole.elevationPrecisionId}
          />
        </FormContainer>
        <FormContainer direction="row">
          <FormInput
            fieldName={"referenceElevation"}
            label={"reference_elevation"}
            value={borehole?.referenceElevation || ""}
            withThousandSeparator={true}
            readonly={!editingEnabled}
          />
          <FormDomainSelect
            fieldName={"qtReferenceElevationId"}
            label={"reference_elevation_qt"}
            readonly={!editingEnabled}
            schemaName={"elevation_precision"}
            selected={borehole.qtReferenceElevationId}
          />
        </FormContainer>
        <FormContainer direction="row">
          <FormDomainSelect
            fieldName={"referenceElevationTypeId"}
            label={"reference_elevation_type"}
            readonly={!editingEnabled}
            schemaName={"reference_elevation_type"}
            selected={borehole.referenceElevationTypeId}
          />
          <FormInput
            fieldName={"hrsId"}
            readonly={true}
            label="height_reference_system"
            value={domains?.find((d: Codelist) => d.id === borehole.hrsId)?.code}
          />
        </FormContainer>
      </FormContainer>
    </FormSegmentBox>
  );
};

export default ElevationSegment;
