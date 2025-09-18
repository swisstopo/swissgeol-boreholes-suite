import { FC, MouseEvent, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dialog, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { BoreholesButton } from "../../../../../../components/buttons/buttons.tsx";
import { FormContainer, FormInput } from "../../../../../../components/form/form.ts";
import { useFormDirtyChanges } from "../../../../../../components/form/useFormDirtyChanges.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../../components/styledComponents.ts";
import { Lithology, LithologyDescription } from "../../lithology.ts";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";

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
    fields.forEach((field, i) => {
      const value = descriptions?.[index]?.[field as keyof LithologyDescription] as number;
      if (value && i > 0) {
        for (let j = 0; j < i; j++) {
          const prevValue = descriptions?.[index]?.[fields[j] as keyof LithologyDescription] as number;
          if (!prevValue) {
            errors[`lithologyDescriptions.${index}.${fields[j]}`] = "lithologyUnconPreviousRequired";
          }
        }
      }
    });
    return Object.keys(errors).length === 0 || errors;
  };

  const formMethods = useForm<Lithology>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      const result = lithologyDescriptionsValidate(values.lithologyDescriptions);
      if (result !== true) {
        Object.entries(result).forEach(([path, message]) => {
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
              curr = curr[key] as FormErrors;
            }
          }
        });
      }
      return { values, errors };
    },
  });
  const { formState, getValues, setValue } = formMethods;
  useFormDirtyChanges({ formState });

  useEffect(() => {
    if (lithology) {
      formMethods.reset(lithology);
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
    <Dialog open={lithology !== undefined} fullScreen>
      <DialogHeaderContainer>
        <Stack direction="row">
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("lithology")}
          </Typography>
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent sx={{ padding: "0 60px", display: "flex", justifyContent: "center" }}>
        <FormProvider {...formMethods}>
          <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
            <BoreholesCard
              data-cy="lithology-basic-data"
              title={t("basicData")}
              action={
                <ToggleButtonGroup
                  value={isUnconsolidated}
                  onChange={(event: MouseEvent<HTMLElement>, isUnconsolidated: boolean) => {
                    setValue("isUnconsolidated", isUnconsolidated);
                  }}
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
              }>
              <FormContainer direction={"row"}>
                <FormInput fieldName={"fromDepth"} label={"fromdepth"} required={true} />
                <FormInput fieldName={"toDepth"} label={"todepth"} required={true} />
              </FormContainer>
            </BoreholesCard>
            <BoreholesCard data-cy="lithology-lithological-description" title={t("lithologyLayerDescription")}>
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
              <FormContainer>
                <FormInput fieldName={"notes"} label={"remarks"} multiline={true} rows={3} />
              </FormContainer>
            </BoreholesCard>
          </Stack>
        </FormProvider>
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
          <BoreholesButton
            variant="contained"
            color="primary"
            label={t("close")}
            onClick={closeDialog}
            disabled={!formState.isValid && Object.keys(formState.errors).length > 0}
          />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
