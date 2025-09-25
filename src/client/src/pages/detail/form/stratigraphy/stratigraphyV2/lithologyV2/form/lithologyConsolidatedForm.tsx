import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Divider } from "@mui/material";
import { BoreholesCard } from "../../../../../../../components/boreholesCard.tsx";
import { FormContainer, FormDomainMultiSelect, FormDomainSelect } from "../../../../../../../components/form/form.ts";
import { LithologyDescriptionEditForm, LithologyEditForm } from "../../../lithology.ts";
import { useLithologyDescriptionShareSync } from "../useLithologyDescriptionShareSync.ts";
import { LithologyDescriptionForm } from "./lithologyDescriptionForm.tsx";

const LithologyDescriptionConsolidatedForm: FC<LithologyDescriptionEditForm> = ({
  lithologyId,
  formMethods,
  isFirst,
  hasBedding,
}) => {
  const index = isFirst ? 0 : 1;
  return (
    <LithologyDescriptionForm
      lithologyId={lithologyId}
      formMethods={formMethods}
      isFirst={isFirst}
      hasBedding={hasBedding}
      fields={[
        [
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.lithologyConId`}
            fieldName={`lithologyDescriptions.${index}.lithologyConId`}
            label={"lithologyCon"}
            schemaName={"lithology_con"}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.colorPrimaryId`}
            fieldName={`lithologyDescriptions.${index}.colorPrimaryId`}
            label={"colorPrimary"}
            schemaName={"color"}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.colorSecondaryId`}
            fieldName={`lithologyDescriptions.${index}.colorSecondaryId`}
            label={"colorSecondary"}
            schemaName={"color"}
          />,
        ],
        [
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.componentConParticleCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.componentConParticleCodelistIds`}
            label={"componentConParticle"}
            schemaName={"component_con_particle"}
          />,
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.componentConMineralCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.componentConMineralCodelistIds`}
            label={"componentConMineral"}
            schemaName={"component_con_mineral"}
          />,
        ],
        [
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.grainSizeId`}
            fieldName={`lithologyDescriptions.${index}.grainSizeId`}
            label={"grainSize"}
            schemaName={"grain_size"}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.grainAngularityId`}
            fieldName={`lithologyDescriptions.${index}.grainAngularityId`}
            label={"grainAngularity"}
            schemaName={"grain_angularity"}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.gradationId`}
            fieldName={`lithologyDescriptions.${index}.gradationId`}
            label={"gradation"}
            schemaName={"gradation"}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.cementationId`}
            fieldName={`lithologyDescriptions.${index}.cementationId`}
            label={"cementation"}
            schemaName={"cementation"}
          />,
        ],
        [
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.structureSynGenCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.structureSynGenCodelistIds`}
            label={"structureSynGen"}
            schemaName={"structure_syn_gen"}
          />,
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.structurePostGenCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.structurePostGenCodelistIds`}
            label={"structurePostGen"}
            schemaName={"structure_post_gen"}
          />,
        ],
      ]}
    />
  );
};

export const LithologyConsolidatedForm: FC<LithologyEditForm> = ({ lithologyId, formMethods }) => {
  const { t } = useTranslation();
  const { watch } = formMethods;
  const hasBedding = watch("hasBedding");
  useLithologyDescriptionShareSync(formMethods);

  return (
    <>
      <BoreholesCard data-cy="lithology-lithology-con" title={t("lithologyConDescription")}>
        <FormContainer>
          <LithologyDescriptionConsolidatedForm
            key={"lithologyDescriptions.0"}
            lithologyId={lithologyId}
            formMethods={formMethods}
            isFirst={true}
            hasBedding={hasBedding}
          />
          {hasBedding && (
            <>
              <Divider />
              <LithologyDescriptionConsolidatedForm
                key={"lithologyDescriptions.1"}
                lithologyId={lithologyId}
                formMethods={formMethods}
                isFirst={false}
              />
            </>
          )}
        </FormContainer>
      </BoreholesCard>
      <BoreholesCard data-cy="lithology-reworking_processes_uncon" title={t("reworkingProcessesCon")}>
        <FormContainer>
          <FormDomainMultiSelect
            fieldName={"textureMataCodelistIds"}
            label={"textureMata"}
            schemaName={"texture_mata"}
          />
          <FormDomainSelect
            fieldName={"alterationDegreeId"}
            label={"alterationDegree"}
            schemaName={"alteration_degree"}
          />
        </FormContainer>
      </BoreholesCard>
    </>
  );
};
