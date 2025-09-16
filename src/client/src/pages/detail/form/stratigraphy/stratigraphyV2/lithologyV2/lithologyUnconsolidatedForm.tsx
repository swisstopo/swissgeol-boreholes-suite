import { useTranslation } from "react-i18next";
import { Box, Divider, Stack } from "@mui/material";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import {
  FormCheckbox,
  FormContainer,
  FormDomainMultiSelect,
  FormDomainSelect,
  FormInput,
} from "../../../../../../components/form/form.ts";
import { LithologyEditForm } from "../../lithology.ts";

interface LithologyDescriptionUnconsolidatedFormProps {
  share: number | null;
  description: LithologyDescription;
  isFirst: boolean;
  hasBedding: boolean;
}

const LithologyDescriptionUnconsolidatedForm: FC<LithologyDescriptionUnconsolidatedFormProps> = ({
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
            fieldName={"lithologyUnconMain"}
            label={"lithologyUnconMain"}
            schemaName={"lithology_uncon_main"}
            selected={description.lithologyUnconMainId}
          />
          <FormDomainSelect
            fieldName={"lithologyUncon2"}
            label={"lithologyUnconSecondary"}
            schemaName={"lithology_uncon_secondary"}
            selected={description.lithologyUncon2Id}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainSelect
            fieldName={"lithologyUncon3"}
            label={"componentUncon"}
            schemaName={"lithology_uncon_secondary"}
            selected={description.lithologyUncon3Id}
          />
          <FormDomainSelect
            fieldName={"lithologyUncon4"}
            label={"lithologyUncon4"}
            schemaName={"lithology_uncon_secondary"}
            selected={description.lithologyUncon4Id}
          />
          <FormDomainSelect
            fieldName={"lithologyUncon5"}
            label={"lithologyUncon5"}
            schemaName={"lithology_uncon_secondary"}
            selected={description.lithologyUncon5Id}
          />
          <FormDomainSelect
            fieldName={"lithologyUncon6"}
            label={"lithologyUncon6"}
            schemaName={"lithology_uncon_secondary"}
            selected={description.lithologyUncon6Id}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={"componentUnconOrganic"}
            label={"componentUnconOrganic"}
            schemaName={"component_uncon_organic"}
            selected={description.componentUnconOrganicCodelistIds}
          />
          <FormDomainMultiSelect
            fieldName={"componentUnconDebris"}
            label={"componentUnconDebris"}
            schemaName={"component_uncon_debris"}
            selected={description.componentUnconDebrisCodelistIds}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
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
            fieldName={"grainShape"}
            label={"grainShape"}
            schemaName={"grain_shape"}
            selected={description.grainShapeCodelistIds}
          />
          <FormDomainMultiSelect
            fieldName={"grainAngularity"}
            label={"grainAngularity"}
            schemaName={"grain_angularity"}
            selected={description.grainAngularityCodelistIds}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={"lithologyUnconCoarse"}
            label={"lithologyUnconCoarse"}
            schemaName={"lithology_uncon_coarse"}
            selected={description.lithologyUnconDebrisCodelistIds}
          />
          <FormCheckbox fieldName={"striae"} label={"striae"} checked={description.hasStriae} />
        </FormContainer>
      </FormContainer>
    </>
  );
};

export const LithologyUnconsolidatedForm: FC<LithologyEditForm> = ({ lithology }) => {
  const { t } = useTranslation();

  return (
    <>
      <BoreholesCard data-cy="lithology-lithology-uncon" title={t("lithologyUncon")} action={<Box></Box>}>
        <FormContainer>
          <LithologyDescriptionUnconsolidatedForm
            description={lithology?.lithologyDescriptions[0]}
            share={lithology?.share}
            hasBedding={lithology?.hasBedding}
          />
          {lithology?.hasBedding && (
            <>
              <Divider />
              <LithologyDescriptionUnconsolidatedForm
                description={lithology?.lithologyDescriptions[1]}
                share={typeof lithology?.share === "number" ? 100 - lithology.share : null}
                isFirst={false}
              />
            </>
          )}
        </FormContainer>
      </BoreholesCard>
      <BoreholesCard data-cy="lithology-property-geotechnical" title={t("propertyGeotechnical")}>
        <FormContainer>
          <FormContainer direction={"row"}>
            <FormDomainSelect
              fieldName={"compactness"}
              label={"compactness"}
              schemaName={"compactness"}
              selected={lithology?.compactnessId}
            />
            <FormDomainSelect
              fieldName={"cohesion"}
              label={"cohesion"}
              schemaName={"cohesion"}
              selected={lithology?.cohesionId}
            />
            <FormDomainSelect
              fieldName={"humidity"}
              label={"humidity"}
              schemaName={"humidity"}
              selected={lithology?.humidityId}
            />
          </FormContainer>
          <FormContainer direction={"row"}>
            <FormDomainSelect
              fieldName={"consistency"}
              label={"consistency"}
              schemaName={"consistency"}
              selected={lithology?.consistencyId}
              sx={{ flex: 1 }}
            />
            <FormDomainSelect
              fieldName={"plasticity"}
              label={"plasticity"}
              schemaName={"plasticity"}
              selected={lithology?.plasticityId}
              sx={{ flex: 1 }}
            />
            <Stack flex={1} />
          </FormContainer>
        </FormContainer>
      </BoreholesCard>
      <Stack direction="row" gap={3} width={"100%"}>
        <BoreholesCard data-cy="lithology-uscs-typing" title={t("uscsTyping")} sx={{ flex: 1 }}>
          <FormContainer>
            <FormDomainMultiSelect
              fieldName={"uscsTypes"}
              label={"uscsType"}
              schemaName={"uscs_type"}
              selected={lithology?.uscsTypeCodelistIds}
            />
            <FormDomainSelect
              fieldName={"uscs_determination"}
              label={"uscs_determination"}
              schemaName={"uscs_determination"}
              selected={lithology?.uscsDeterminationId}
            />
          </FormContainer>
        </BoreholesCard>
        <BoreholesCard
          data-cy="lithology-reworking_processes_uncon"
          title={t("reworkingProcessesUncon")}
          sx={{ flex: 1 }}>
          <FormContainer>
            <FormDomainMultiSelect
              fieldName={"rockCondition"}
              label={"rockCondition"}
              schemaName={"rock_condition"}
              selected={lithology?.rockConditionCodelistIds}
            />
            <FormDomainSelect
              fieldName={"alterationDegree"}
              label={"alterationDegree"}
              schemaName={"alteration_degree"}
              selected={lithology?.alterationDegreeId}
            />
          </FormContainer>
        </BoreholesCard>
      </Stack>
    </>
  );
};
