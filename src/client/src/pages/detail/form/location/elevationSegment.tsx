import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { TextField } from "@mui/material/";
import { t } from "i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { FormContainer, FormDomainSelect, FormInput } from "../../../../components/form/form.ts";
import { Codelist } from "../../../../components/legacyComponents/domain/domainInterface.ts";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface ElevationSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
}

const ElevationSegment: FC<ElevationSegmentProps> = ({ borehole, editingEnabled, formMethods }) => {
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
            value={borehole?.referenceElevation}
            withThousandSeparator={true}
            readonly={!editingEnabled}
          />
          <FormDomainSelect
            fieldName={"referenceElevationPrecisionId"}
            label={"reference_elevation_qt"}
            readonly={!editingEnabled}
            schemaName={"elevation_precision"}
            selected={borehole.referenceElevationPrecisionId}
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
          <TextField
            InputProps={{
              readOnly: true,
            }}
            className="readonly"
            label={t("height_reference_system")}
            value={domains?.find((d: Codelist) => d.id === borehole.hrsId)?.en}
          />
        </FormContainer>
      </FormContainer>
    </FormSegmentBox>
  );
};

export default ElevationSegment;
