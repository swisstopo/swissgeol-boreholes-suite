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
import { LithologyDescription, LithologyEditForm } from "../../lithology.ts";

interface LithologyDescriptionUnconsolidatedFormProps {
  share: number | null;
  description: LithologyDescription;
  isFirst: boolean;
  hasBedding: boolean;
}

const LithologyDescriptionConsolidatedForm: FC<LithologyDescriptionUnconsolidatedFormProps> = ({
  share,
  description,
  isFirst = true,
  hasBedding,
}) => {
  const index = isFirst ? 0 : 1;
  return (
    <>
      <FormContainer>
        <FormContainer direction={"row"}>
          {isFirst && <FormCheckbox fieldName={"bedding"} label={"bedding"} checked={hasBedding} />}
          <FormInput fieldName={"share"} label={"share"} value={share} sx={{ flex: "0 0 87px" }} disabled={!isFirst} />
          <FormDomainSelect
            fieldName={"lithologyCon"}
            label={"lithologyCon"}
            schemaName={"lithology_con"}
            selected={description.lithologyConId}
          />
          <FormDomainSelect
            fieldName={"colorPrimary"}
            label={"colorPrimary"}
            schemaName={"color"}
            selected={description.colorPrimaryId}
          />
          <FormDomainSelect
            fieldName={"colorSecondary"}
            label={"colorSecondary"}
            schemaName={"color"}
            selected={description.colorSecondaryId}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={"componentConParticle"}
            label={"componentConParticle"}
            schemaName={"component_con_particle"}
            selected={description.componentConParticleCodelistIds}
          />
          <FormDomainMultiSelect
            fieldName={"componentConMineral"}
            label={"componentConMineral"}
            schemaName={"component_con_mineral"}
            selected={description.componentConMineralCodelistIds}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainSelect
            fieldName={"grainSize"}
            label={"grainSize"}
            schemaName={"grain_size"}
            selected={description.grainSizeId}
          />
          <FormDomainSelect
            fieldName={"grainAngularity"}
            label={"grainAngularity"}
            schemaName={"grain_angularity"}
            selected={description.grainAngularityId}
          />
          <FormDomainSelect
            fieldName={"gradation"}
            label={"gradation"}
            schemaName={"gradation"}
            selected={description.gradationId}
          />
          <FormDomainSelect
            fieldName={"cementation"}
            label={"cementation"}
            schemaName={"cementation"}
            selected={description.cementationId}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={"structureSynGen"}
            label={"structureSynGen"}
            schemaName={"structure_syn_gen"}
            selected={description.structureSynGenCodelistIds}
          />
          <FormDomainMultiSelect
            fieldName={"structurePostGen"}
            label={"structurePostGen"}
            schemaName={"structure_post_gen"}
            selected={description.structurePostGenCodelistIds}
          />
        </FormContainer>
      </FormContainer>
    </>
  );
};

export const LithologyConsolidatedForm: FC<LithologyEditForm> = ({ lithology }) => {
  const { t } = useTranslation();

  return (
    <>
      <BoreholesCard data-cy="lithology-lithology-con" title={t("lithologyConDescription")}>
        <FormContainer>
          <LithologyDescriptionConsolidatedForm
            description={lithology?.lithologyDescriptions[0]}
            share={lithology?.share}
            hasBedding={lithology?.hasBedding}
          />
          {lithology?.hasBedding && (
            <>
              <Divider />
              <LithologyDescriptionConsolidatedForm
                description={lithology?.lithologyDescriptions[1]}
                share={typeof lithology?.share === "number" ? 100 - lithology.share : null}
                isFirst={false}
              />
            </>
          )}
        </FormContainer>
      </BoreholesCard>
      <BoreholesCard data-cy="lithology-reworking_processes_uncon" title={t("reworkingProcessesCon")}>
        <FormContainer>
          <FormDomainMultiSelect
            fieldName={"textureMata"}
            label={"textureMata"}
            schemaName={"texture_mata"}
            selected={lithology?.textureMataCodelistIds}
          />
          <FormDomainSelect
            fieldName={"alterationDegree"}
            label={"alterationDegree"}
            schemaName={"alteration_degree"}
            selected={lithology?.alterationDegreeId}
          />
        </FormContainer>
      </BoreholesCard>
    </>
  );
};
