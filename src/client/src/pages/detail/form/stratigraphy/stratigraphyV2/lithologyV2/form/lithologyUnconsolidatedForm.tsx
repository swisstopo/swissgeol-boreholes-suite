import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Divider, Stack, TextField, Typography } from "@mui/material";
import { theme } from "../../../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../../../components/boreholesCard.tsx";
import { Codelist, CodelistLabelStyle, useCodelistSchema } from "../../../../../../../components/codelist.ts";
import {
  FormCheckbox,
  FormContainer,
  FormDomainMultiSelect,
  FormDomainSelect,
} from "../../../../../../../components/form/form.ts";
import {
  Lithology,
  LithologyDescription,
  LithologyDescriptionEditForm,
  LithologyEditForm,
} from "../../../lithology.ts";
import { useLithologyDescriptionShareSync } from "../useLithologyDescriptionShareSync.ts";
import { LithologyDescriptionForm } from "./lithologyDescriptionForm.tsx";

const LithologyDescriptionUnconsolidatedForm: FC<LithologyDescriptionEditForm> = ({
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
            key={`lithologyDescriptions.${index}.lithologyUnconMainId`}
            fieldName={`lithologyDescriptions.${index}.lithologyUnconMainId`}
            label={"lithologyUnconMain"}
            schemaName={"lithology_uncon_main"}
            labelStyle={CodelistLabelStyle.TextAndCode}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.lithologyUncon2Id`}
            fieldName={`lithologyDescriptions.${index}.lithologyUncon2Id`}
            label={"lithologyUnconSecondary"}
            schemaName={"lithology_uncon_secondary"}
            labelStyle={CodelistLabelStyle.TextAndCode}
          />,
        ],
        [
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.lithologyUncon3Id`}
            fieldName={`lithologyDescriptions.${index}.lithologyUncon3Id`}
            label={"componentUncon"}
            schemaName={"lithology_uncon_secondary"}
            ignoreOverlow
            labelStyle={CodelistLabelStyle.TextAndCode}
            sx={{
              "& .MuiInputLabel-root": {
                overflow: "visible",
              },
            }}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.lithologyUncon4Id`}
            fieldName={`lithologyDescriptions.${index}.lithologyUncon4Id`}
            schemaName={"lithology_uncon_secondary"}
            labelStyle={CodelistLabelStyle.TextAndCode}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.lithologyUncon5Id`}
            fieldName={`lithologyDescriptions.${index}.lithologyUncon5Id`}
            schemaName={"lithology_uncon_secondary"}
            labelStyle={CodelistLabelStyle.TextAndCode}
          />,
          <FormDomainSelect
            key={`lithologyDescriptions.${index}.lithologyUncon6Id`}
            fieldName={`lithologyDescriptions.${index}.lithologyUncon6Id`}
            schemaName={"lithology_uncon_secondary"}
            labelStyle={CodelistLabelStyle.TextAndCode}
          />,
        ],
        [
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.componentUnconOrganicCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.componentUnconOrganicCodelistIds`}
            label={"componentUnconOrganic"}
            schemaName={"component_uncon_organic"}
          />,
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.componentUnconDebrisCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.componentUnconDebrisCodelistIds`}
            label={"componentUnconDebris"}
            schemaName={"component_uncon_debris"}
          />,
        ],
        [
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
            key={`lithologyDescriptions.${index}.grainShapeCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.grainShapeCodelistIds`}
            label={"grainShape"}
            schemaName={"grain_shape"}
          />,
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.grainAngularityCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.grainAngularityCodelistIds`}
            label={"grainAngularity"}
            schemaName={"grain_angularity"}
          />,
        ],
        [
          <FormDomainMultiSelect
            key={`lithologyDescriptions.${index}.lithologyUnconDebrisCodelistIds`}
            fieldName={`lithologyDescriptions.${index}.lithologyUnconDebrisCodelistIds`}
            label={"lithologyUnconCoarse"}
            schemaName={"lithology_con"}
          />,
          <FormCheckbox
            key={`lithologyDescriptions.${index}.hasStriae`}
            fieldName={`lithologyDescriptions.${index}.hasStriae`}
            label={"striae"}
          />,
        ],
      ]}
    />
  );
};

export const LithologyUnconsolidatedForm: FC<LithologyEditForm> = ({ lithologyId, formMethods }) => {
  const { t } = useTranslation();
  const { data: lithologyUnconMain } = useCodelistSchema("lithology_uncon_main");
  const { data: lithologyUnconSecondary } = useCodelistSchema("lithology_uncon_secondary");
  const [enCode, setEnCode] = useState("");
  const { watch } = formMethods;
  const hasBedding = watch("hasBedding");
  useLithologyDescriptionShareSync(formMethods);

  const getCode = (
    description: LithologyDescription,
    field: string,
    idField: string,
    codelist: { id: number | string; code: string }[],
  ): string | undefined => {
    if (description[field as keyof LithologyDescription]) {
      return (description[field as keyof LithologyDescription] as Codelist)?.code;
    } else if (description[idField as keyof LithologyDescription]) {
      const id = description[idField as keyof LithologyDescription];
      const found = codelist?.find(l => l.id === id);
      if (found) {
        return found.code;
      }
    }
    return undefined;
  };

  const buildLithologyUnconEnCode = useCallback(
    (values: Lithology) => {
      let enCode = "";
      const descriptions: LithologyDescription[] | undefined = values.lithologyDescriptions;
      if (descriptions && descriptions.length > 0) {
        enCode = descriptions
          ?.map(description => {
            const codes = [];
            // Main
            const mainCode = getCode(
              description,
              "lithologyUnconMain",
              "lithologyUnconMainId",
              lithologyUnconMain ?? [],
            );
            if (mainCode) codes.push(mainCode);
            // 2-6
            for (let i = 2; i <= 6; i++) {
              const code = getCode(
                description,
                `lithologyUncon${i}`,
                `lithologyUncon${i}Id`,
                lithologyUnconSecondary ?? [],
              );
              if (code) codes.push(code);
            }
            return codes.join("-");
          })
          .filter(c => c.length > 0)
          .join(" / ");
      }
      setEnCode(enCode);
    },
    [lithologyUnconMain, lithologyUnconSecondary],
  );

  useEffect(() => {
    const values = formMethods.getValues();
    buildLithologyUnconEnCode(values);

    formMethods.watch(values => {
      buildLithologyUnconEnCode(values as Lithology);
    });
  }, [buildLithologyUnconEnCode, formMethods]);

  return (
    <>
      <BoreholesCard
        data-cy="lithology-lithology-uncon"
        title={t("lithologyUncon")}
        action={
          <>
            <Typography variant={"body2"} color={theme.palette.action.disabled}>
              {t("lithologyUnconType")}
            </Typography>
            <TextField disabled fullWidth value={enCode} sx={{ margin: "0 !important" }} />
          </>
        }
        sx={{
          "& .MuiCardHeader-root": {
            width: "100%",
            justifyContent: "space-between",
            "& .MuiCardHeader-content": {
              flex: "0 0 auto",
            },
            "& .MuiCardHeader-action": {
              flex: "0 1 auto",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,

              "& .MuiTypography-root": {
                flex: "0 0 auto",
              },
            },
          },
        }}>
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
