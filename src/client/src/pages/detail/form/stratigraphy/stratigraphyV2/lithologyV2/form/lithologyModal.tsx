import { FC, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { theme } from "../../../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../../../components/boreholesCard.tsx";
import { FormContainer } from "../../../../../../../components/form/formContainer.tsx";
import { FormInput } from "../../../../../../../components/form/formInput.tsx";
import { Lithology } from "../../../lithology.ts";
import { FormDialog } from "./formDialog.tsx";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";
import {
  FormErrors,
  prepareLithologyForSubmit,
  validateDepths,
  validateLithologyUnconValues,
} from "./lithologyUtils.ts";
import { RemarksFormSection } from "./remarksFormSection.tsx";

interface LithologyEditModalProps {
  lithology: Lithology | undefined;
  updateLithology: (lithology: Lithology, hasChanges: boolean) => void;
}

export const LithologyModal: FC<LithologyEditModalProps> = ({ lithology, updateLithology }) => {
  const { t } = useTranslation();
  const formMethods = useForm<Lithology>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      validateDepths(values, errors);
      validateLithologyUnconValues(values.lithologyDescriptions, errors);
      return { values, errors };
    },
  });
  const { formState, getValues } = formMethods;

  useEffect(() => {
    if (lithology) {
      if (lithology.hasBedding === undefined) lithology.hasBedding = false;
      if (lithology.isUnconsolidated === undefined) lithology.isUnconsolidated = true;

      // Add first lithology description if not present
      if (!lithology?.lithologyDescriptions) {
        lithology.lithologyDescriptions = [
          {
            id: 0,
            lithologyId: 0,
            isFirst: true,
          },
        ];
      }

      formMethods.reset(lithology);
    }
  }, [lithology, formMethods]);

  const isUnconsolidated = formMethods.watch("isUnconsolidated");

  const closeDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!formState.isDirty || isValid) {
      const values = getValues();
      prepareLithologyForSubmit(values);
      updateLithology(
        { ...lithology, ...values } as Lithology,
        formState.isDirty || (Boolean(lithology?.isGap) && isValid),
      );
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
            <FormContainer>
              <FormContainer direction={"row"}>
                <FormInput
                  fieldName={"fromDepth"}
                  label={"fromdepth"}
                  required={true}
                  value={lithology?.fromDepth}
                  withThousandSeparator={true}
                />
                <FormInput
                  fieldName={"toDepth"}
                  label={"todepth"}
                  required={true}
                  value={lithology?.toDepth}
                  withThousandSeparator={true}
                />
              </FormContainer>
            </FormContainer>
          </BoreholesCard>
          {/* // TODO: Load description from lithological descriptions based on depths https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2386 */}
          {/*<BoreholesCard data-cy="lithology-lithological-description" title={t("lithologyLayerDescription")}>*/}
          {/*  <FormContainer>*/}
          {/*    <FormInput*/}
          {/*      fieldName={"description"}*/}
          {/*      label={"description"}*/}
          {/*      value={""}*/}
          {/*      multiline={true}*/}
          {/*      rows={3}*/}
          {/*      readonly={true}*/}
          {/*    />*/}
          {/*  </FormContainer>*/}
          {/*</BoreholesCard>*/}
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
