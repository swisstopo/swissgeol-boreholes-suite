import { FormContainer, FormDomainSelect } from "../../../../components/form/form.ts";
import { BoreholeGeneralProps } from "./boreholePanelInterfaces.ts";

const BoreholeGeneralSegment = ({ borehole, editingEnabled }: BoreholeGeneralProps) => {
  return (
    <FormContainer direction="row">
      <FormDomainSelect
        fieldName={"typeId"}
        label={"borehole_type"}
        schemaName={"borehole_type"}
        readonly={!editingEnabled}
        selected={borehole.typeId}
      />
      <FormDomainSelect
        fieldName={"purposeId"}
        label={"purpose"}
        schemaName={"extended.purpose"}
        readonly={!editingEnabled}
        selected={borehole.purposeId}
      />
      <FormDomainSelect
        fieldName={"statusId"}
        label={"boreholestatus"}
        schemaName={"extended.status"}
        readonly={!editingEnabled}
        selected={borehole.statusId}
      />
    </FormContainer>
  );
};

export default BoreholeGeneralSegment;
