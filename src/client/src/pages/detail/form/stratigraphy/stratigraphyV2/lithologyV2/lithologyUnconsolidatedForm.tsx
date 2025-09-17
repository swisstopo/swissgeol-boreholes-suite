import { FC, useEffect } from "react";
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
import { LithologyDescription, LithologyDescriptionEditForm, LithologyEditForm } from "../../lithology.ts";

const LithologyDescriptionUnconsolidatedForm: FC<LithologyDescriptionEditForm> = ({
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
            fieldName={`lithologyDescriptions.${index}.lithologyUnconMainId`}
            label={"lithologyUnconMain"}
            schemaName={"lithology_uncon_main"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.lithologyUncon2Id`}
            label={"lithologyUnconSecondary"}
            schemaName={"lithology_uncon_secondary"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.lithologyUncon3Id`}
            label={"componentUncon"}
            schemaName={"lithology_uncon_secondary"}
            sx={{
              "& .MuiInputLabel-root": {
                overflow: "visible",
              },
            }}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.lithologyUncon4Id`}
            schemaName={"lithology_uncon_secondary"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.lithologyUncon5Id`}
            schemaName={"lithology_uncon_secondary"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.lithologyUncon6Id`}
            schemaName={"lithology_uncon_secondary"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.componentUnconOrganicCodelistIds`}
            label={"componentUnconOrganic"}
            schemaName={"component_uncon_organic"}
          />
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.componentUnconDebrisCodelistIds`}
            label={"componentUnconDebris"}
            schemaName={"component_uncon_debris"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.colorPrimaryId`}
            label={"colorPrimary"}
            schemaName={"color"}
          />
          <FormDomainSelect
            fieldName={`lithologyDescriptions.${index}.colorSecondaryId`}
            label={"colorSecondary"}
            schemaName={"color"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.grainShapeCodelistIds`}
            label={"grainShape"}
            schemaName={"grain_shape"}
          />
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.grainAngularityCodelistIds`}
            label={"grainAngularity"}
            schemaName={"grain_angularity"}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormDomainMultiSelect
            fieldName={`lithologyDescriptions.${index}.lithologyUnconDebrisCodelistIds`}
            label={"lithologyUnconCoarse"}
            schemaName={"lithology_con"}
          />
          <FormCheckbox fieldName={`lithologyDescriptions.${index}.hasStriae`} label={"striae"} />
        </FormContainer>
      </FormContainer>
    </>
  );
};

export const LithologyUnconsolidatedForm: FC<LithologyEditForm> = ({ lithologyId, formMethods }) => {
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
      <BoreholesCard data-cy="lithology-lithology-uncon" title={t("lithologyUncon")} action={<Box></Box>}>
        <FormContainer>
          <LithologyDescriptionUnconsolidatedForm
            key={"lithologyDescriptions.0"}
            lithologyId={lithologyId}
            formMethods={formMethods}
            isFirst={true}
            hasBedding={hasBedding}
          />
          {hasBedding && (
            <>
              <Divider />
              <LithologyDescriptionUnconsolidatedForm
                key={"lithologyDescriptions.1"}
                lithologyId={lithologyId}
                formMethods={formMethods}
                isFirst={false}
              />
            </>
          )}
        </FormContainer>
      </BoreholesCard>
      <BoreholesCard data-cy="lithology-property-geotechnical" title={t("propertyGeotechnical")}>
        <FormContainer>
          <FormContainer direction={"row"}>
            <FormDomainSelect fieldName={"compactnessId"} label={"compactness"} schemaName={"compactness"} />
            <FormDomainSelect fieldName={"cohesionId"} label={"cohesion"} schemaName={"cohesion"} />
            <FormDomainSelect fieldName={"humidityId"} label={"humidity"} schemaName={"humidity"} />
          </FormContainer>
          <FormContainer direction={"row"}>
            <FormDomainSelect
              fieldName={"consistencyId"}
              label={"consistency"}
              schemaName={"consistency"}
              sx={{ flex: 1 }}
            />
            <FormDomainSelect
              fieldName={"plasticityId"}
              label={"plasticity"}
              schemaName={"plasticity"}
              sx={{ flex: 1 }}
            />
            <Stack flex={1} />
          </FormContainer>
        </FormContainer>
      </BoreholesCard>
      <Stack direction="row" gap={3} width={"100%"}>
        <BoreholesCard data-cy="lithology-uscs-typing" title={t("uscsTyping")} sx={{ flex: 1 }}>
          <FormContainer>
            <FormDomainMultiSelect fieldName={"uscsTypeCodelistIds"} label={"uscsType"} schemaName={"uscs_type"} />
            <FormDomainSelect
              fieldName={"uscsDeterminationId"}
              label={"uscs_determination"}
              schemaName={"uscs_determination"}
            />
          </FormContainer>
        </BoreholesCard>
        <BoreholesCard
          data-cy="lithology-reworking_processes_uncon"
          title={t("reworkingProcessesUncon")}
          sx={{ flex: 1 }}>
          <FormContainer>
            <FormDomainMultiSelect
              fieldName={"rockConditionCodelistIds"}
              label={"rockCondition"}
              schemaName={"rock_condition"}
            />
            <FormDomainSelect
              fieldName={"alterationDegreeId"}
              label={"alterationDegree"}
              schemaName={"alteration_degree"}
            />
          </FormContainer>
        </BoreholesCard>
      </Stack>
    </>
  );
};
