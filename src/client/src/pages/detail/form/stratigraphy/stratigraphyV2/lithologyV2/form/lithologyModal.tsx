import { FC, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { theme } from "../../../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../../../components/boreholesCard.tsx";
import { FormContainer, FormInput } from "../../../../../../../components/form/form.ts";
import { useFormDirtyChanges } from "../../../../../../../components/form/useFormDirtyChanges.tsx";
import { Lithology, LithologyDescription } from "../../../lithology.ts";
import { BasicDataFormSection } from "./basicDataFormSection.tsx";
import { FormDialog } from "./formDialog.tsx";
import { initializeLithologicalDescriptionInForm, initializeLithologyInForm } from "./formInitializers.ts";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";
import { RemarksFormSection } from "./remarksFormSection.tsx";

type FormError = { type: string; message: string };
type FormErrors = { [key: string]: FormError | FormErrors };

interface LithologyEditModalProps {
  lithology: Lithology | undefined;
  updateLithology: (lithology: Lithology, hasChanges: boolean) => void;
}

export const LithologyModal: FC<LithologyEditModalProps> = ({ lithology, updateLithology }) => {
  const { t } = useTranslation();

  const lithologyDescriptionsValidate = (descriptions: LithologyDescription[] | undefined) => {
    if (!descriptions || descriptions.length === 0) return true;

    const index = descriptions?.[0].isFirst ? 0 : 1;
    const errors: Record<string, string> = {};
    const fields = [
      "lithologyUnconMainId",
      "lithologyUncon2Id",
      "lithologyUncon3Id",
      "lithologyUncon4Id",
      "lithologyUncon5Id",
      "lithologyUncon6Id",
    ];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const value = descriptions?.[index]?.[field as keyof LithologyDescription] as number;
      if (value && i > 0) {
        for (let j = 0; j < i; j++) {
          const prevValue = descriptions?.[index]?.[fields[j] as keyof LithologyDescription] as number;
          if (!prevValue) {
            errors[`lithologyDescriptions.${index}.${fields[j]}`] = "lithologyUnconPreviousRequired";
          }
        }
      }
    }
    return Object.keys(errors).length === 0 || errors;
  };

  const buildErrorStructure = (result: boolean | Record<string, string>, errors: FormErrors) => {
    for (const [path, message] of Object.entries(result)) {
      const keys = path.split(".");
      let curr = errors;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          curr[key] = { type: "manual", message };
        } else {
          if (typeof curr[key] !== "object" || curr[key] === null || "type" in curr[key]) {
            curr[key] = {};
          }
          curr = curr[key];
        }
      }
    }
  };

  const formMethods = useForm<Lithology>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      const result = lithologyDescriptionsValidate(values.lithologyDescriptions);
      if (result !== true) {
        buildErrorStructure(result, errors);
      }
      return { values, errors };
    },
  });
  const { formState, getValues } = formMethods;
  useFormDirtyChanges({ formState });

  useEffect(() => {
    if (lithology) {
      formMethods.reset(lithology);
      initializeLithologyInForm(formMethods, lithology);

      // Add first lithological description if not present
      if (!lithology?.lithologyDescriptions) {
        lithology.lithologyDescriptions = [
          {
            id: 0,
            lithologyId: 0,
            isFirst: true,
          },
        ];
      }

      for (const [index, description] of (lithology.lithologyDescriptions ?? []).entries()) {
        initializeLithologicalDescriptionInForm(index, description, formMethods);
      }
    }
  }, [lithology, formMethods]);

  const isUnconsolidated = formMethods.watch("isUnconsolidated");

  const closeDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!formState.isDirty || isValid) {
      const values = getValues();
      updateLithology({ ...lithology, ...values } as Lithology, formState.isDirty);
    }
  };

  return (
    <FormDialog
      open={lithology !== undefined}
      title={t("lithology")}
      onClose={closeDialog}
      isCloseDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
          <BoreholesCard
            data-cy="lithology-basic-data"
            title={t("basicData")}
            action={
              <Controller
                name="isUnconsolidated"
                control={formMethods.control}
                defaultValue={lithology?.isUnconsolidated === undefined ? true : lithology.isUnconsolidated}
                render={({ field }) => (
                  <ToggleButtonGroup
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    exclusive
                    sx={{
                      boxShadow: "none",
                      border: `1px solid ${theme.palette.border.light}`,
                    }}>
                    <ToggleButton value={true}>
                      <Typography>{t("unconsolidated")}</Typography>
                    </ToggleButton>
                    <ToggleButton value={false}>
                      <Typography>{t("consolidated")}</Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            }>
            <BasicDataFormSection />
          </BoreholesCard>
          <BoreholesCard data-cy="lithology-lithological-description" title={t("lithologyLayerDescription")}>
            {/* // TODO: Load description from lithological descriptions based on depths */}
            <FormContainer>
              <FormInput
                fieldName={"description"}
                label={"description"}
                value={""}
                multiline={true}
                rows={3}
                readonly={true}
              />
            </FormContainer>
          </BoreholesCard>
          {lithology &&
            (isUnconsolidated ? (
              <LithologyUnconsolidatedForm lithologyId={lithology.id} formMethods={formMethods} />
            ) : (
              <LithologyConsolidatedForm lithologyId={lithology.id} formMethods={formMethods} />
            ))}
          <BoreholesCard data-cy="lithology-notes" title={t("remarks")}>
            <RemarksFormSection fieldName="notes" label="remarks" />
          </BoreholesCard>
          <Stack pb={4.5} />
        </Stack>
      </FormProvider>
    </FormDialog>
  );
};
