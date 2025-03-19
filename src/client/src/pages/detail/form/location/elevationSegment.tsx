import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDomains } from "../../../../api/fetchApiV2";
import { Codelist } from "../../../../components/Codelist.ts";
import { FormContainer, FormDomainSelect, FormInput, FormInputDisplayOnly } from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface ElevationSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
}

const ElevationSegment: FC<ElevationSegmentProps> = ({ borehole, formMethods }) => {
  const { data: domains } = useDomains();

  return (
    <FormSegmentBox>
      <FormContainer>
        <FormContainer direction="row">
          <FormInput
            fieldName={"elevationZ"}
            label={"elevation_z"}
            value={borehole.elevationZ}
            controlledValue={formMethods.watch("elevationZ") ?? ""}
            withThousandSeparator={true}
          />
          <FormDomainSelect
            fieldName={"elevationPrecisionId"}
            label={"elevation_precision"}
            schemaName={"elevation_precision"}
            selected={borehole.elevationPrecisionId}
          />
        </FormContainer>
        <FormContainer direction="row">
          <FormInput
            fieldName={"referenceElevation"}
            label={"reference_elevation"}
            value={borehole?.referenceElevation}
            withThousandSeparator={true}
          />
          <FormDomainSelect
            fieldName={"referenceElevationPrecisionId"}
            label={"reference_elevation_qt"}
            schemaName={"elevation_precision"}
            selected={borehole.referenceElevationPrecisionId}
          />
        </FormContainer>
        <FormContainer direction="row">
          <FormDomainSelect
            fieldName={"referenceElevationTypeId"}
            label={"reference_elevation_type"}
            schemaName={"reference_elevation_type"}
            selected={borehole.referenceElevationTypeId}
          />
          <FormInputDisplayOnly
            label={"height_reference_system"}
            value={domains?.find((d: Codelist) => d.id === borehole.hrsId)?.en}
          />
        </FormContainer>
      </FormContainer>
    </FormSegmentBox>
  );
};

export default ElevationSegment;
