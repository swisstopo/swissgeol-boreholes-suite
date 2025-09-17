import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Divider } from "@mui/material";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import {
  FormCheckbox,
  FormContainer,
  FormDomainMultiSelect,
  FormDomainSelect,
  FormInput,
} from "../../../../../../components/form/form.ts";
import { LithologyDescription, LithologyDescriptionEditForm, LithologyEditForm } from "../../lithology.ts";

const LithologyDescriptionConsolidatedForm: FC<LithologyDescriptionEditForm> = ({
  lithologyId,
  formMethods,
  isFirst,
  hasBedding,
}) => {
  const { getValues, setValue } = formMethods;
  const index = isFirst ? 0 : 1;
  return (
    <>
      <FormContainer>
        <FormContainer direction={"row"}>
          {isFirst && hasBedding !== undefined && (
            <FormCheckbox
              fieldName={"hasBedding"}
              label={"bedding"}
              onChange={hasBedding => {
                if (!hasBedding) {
                  setValue("share", undefined);
                  const currentDescriptions = getValues("lithologyDescriptions");
                  const filtered = Array.isArray(currentDescriptions)
                    ? currentDescriptions.filter(d => d.isFirst === true)
                    : [];
                  const result = [filtered[0]];
                  setValue("lithologyDescriptions", result);
                } else {
                  setValue("lithologyDescriptions.1", {
                    id: 0,
                    lithologyId: lithologyId,
                    isFirst: false,
                  } as LithologyDescription);
                }
              }}
            />
          )}
          <FormInput
            fieldName={isFirst ? "share" : "shareInverse"}
            label={"share"}
            sx={{ flex: "0 0 87px" }}
            disabled={hasBedding === false || !isFirst}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.lithologyConId`}
            label={"lithologyCon"}
            schemaName={"lithology_con"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.colorPrimary`}
            label={"colorPrimary"}
            schemaName={"color"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.colorSecondary`}
            label={"colorSecondary"}
            schemaName={"color"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.componentConParticleCodelistIds`}
            label={"componentConParticle"}
            schemaName={"component_con_particle"}
          />
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.componentConMineralCodelistIds`}
            label={"componentConMineral"}
            schemaName={"component_con_mineral"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.grainSize`}
            label={"grainSize"}
            schemaName={"grain_size"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.grainAngularity`}
            label={"grainAngularity"}
            schemaName={"grain_angularity"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.gradation`}
            label={"gradation"}
            schemaName={"gradation"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.cementation`}
            label={"cementation"}
            schemaName={"cementation"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.structureSynGenCodelistIds`}
            label={"structureSynGen"}
            schemaName={"structure_syn_gen"}
          />
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.structurePostGenCodelistIds`}
            label={"structurePostGen"}
            schemaName={"structure_post_gen"}
          />
        </FormContainer>
      </FormContainer>
    </>
  );
};

export const LithologyConsolidatedForm: FC<LithologyEditForm> = ({ lithologyId, formMethods }) => {
  const { t } = useTranslation();

  const { setValue, watch } = formMethods;
  const hasBedding = watch("hasBedding");
  const share = watch("share");
  useEffect(() => {
    if (hasBedding && share !== "" && !isNaN(Number(share))) {
      setValue("shareInverse", 100 - Number(share));
    } else {
      setValue("shareInverse", undefined);
    }
  }, [hasBedding, setValue, share]);

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
            fieldName={"alterationDegree"}
            label={"alterationDegree"}
            schemaName={"alteration_degree"}
          />
        </FormContainer>
      </BoreholesCard>
    </>
  );
};
