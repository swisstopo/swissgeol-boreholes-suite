import { FC, useContext, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { FormErrors, FormValueType } from "../../../../../../components/form/form.ts";
import { FormContainer } from "../../../../../../components/form/formContainer.tsx";
import { FormDialog } from "../../../../../../components/form/formDialog.tsx";
import { FormInput } from "../../../../../../components/form/formInput.tsx";
import { validateDepths } from "../../../../../../components/form/formUtils.ts";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { capitalizeFirstLetter } from "../../../../../../utils.ts";
import { Lithology } from "../../lithology.ts";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";
import { prepareLithologyForSubmit, validateLithologyUnconValues } from "./lithologyUtils.ts";
import { RemarksFormSection } from "./remarksFormSection.tsx";

interface LithologyEditModalProps {
  lithology: Lithology | undefined;
  updateLithology: (lithology: Lithology, hasChanges: boolean) => void;
}

type RockTypeToggleValue = boolean | "unspecified";

const labelKey = (value: boolean | null | "unspecified"): "unconsolidated" | "consolidated" | "unspecified" => {
  if (value === true) return "unconsolidated";
  if (value === false) return "consolidated";
  return "unspecified";
};

export const LithologyModal: FC<LithologyEditModalProps> = ({ lithology, updateLithology }) => {
  const { t } = useTranslation();
  const formMethods = useForm<Lithology>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      validateDepths(values, errors);
      validateLithologyUnconValues(values.lithologyDescriptions, errors, values.isUnconsolidated);
      if (Object.keys(errors).length > 0) {
        return { values: {}, errors };
      }
      return { values, errors: {} };
    },
  });
  const { formState, getValues } = formMethods;
  const { showPrompt } = useContext(PromptContext);

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
    const values = getValues();
    const isValid = await formMethods.trigger();
    const hasChanges = JSON.stringify(lithology) !== JSON.stringify(values);

    // Close dialog if no changes have been made or the form is valid
    if (!hasChanges || isValid) {
      prepareLithologyForSubmit(values);
      updateLithology({ ...lithology, ...values } as Lithology, hasChanges || (Boolean(lithology?.isGap) && isValid));
    }
  };

  const rockTypeToggle = (
    <Controller
      name="isUnconsolidated"
      control={formMethods.control}
      defaultValue={lithology?.isUnconsolidated === undefined ? true : lithology.isUnconsolidated}
      render={({ field }) => (
        <ToggleButtonGroup
          value={field.value === null ? "unspecified" : field.value}
          onChange={(_, newToggleValue: RockTypeToggleValue | null) => {
            if (newToggleValue === null) return; // user clicked the active button — ignore deselect
            const newValue: boolean | null = newToggleValue === "unspecified" ? null : newToggleValue;
            showPrompt(
              t("switchUnconsolidatedMessage", {
                current: t(labelKey(field.value)),
                new: t(labelKey(newToggleValue)),
              }),
              [
                {
                  label: "cancel",
                  action: () => {},
                },
                {
                  label: "continue",
                  variant: "contained",
                  action: () => {
                    const currentValues = formMethods.getValues();
                    formMethods.reset({
                      id: currentValues.id,
                      stratigraphyId: currentValues.stratigraphyId,
                      fromDepth: currentValues.fromDepth,
                      toDepth: currentValues.toDepth,
                      isUnconsolidated: newValue,
                      hasBedding: false,
                      lithologyDescriptions: [
                        {
                          id: 0,
                          lithologyId: currentValues.id,
                          isFirst: true,
                        },
                      ],
                      notes: "",
                    } as Lithology);
                  },
                },
              ],
            );
          }}
          exclusive
          sx={{
            boxShadow: "none",
            border: `1px solid ${theme.palette.border.light}`,
          }}>
          <ToggleButton value={true}>
            <Typography>{capitalizeFirstLetter(t("unconsolidated"))}</Typography>
          </ToggleButton>
          <ToggleButton value={false}>
            <Typography>{capitalizeFirstLetter(t("consolidated"))}</Typography>
          </ToggleButton>
          <ToggleButton value="unspecified">
            <Typography>{capitalizeFirstLetter(t("unspecified"))}</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    />
  );

  return (
    <FormDialog
      open={lithology !== undefined}
      title={t("lithology")}
      onClose={closeDialog}
      isCloseDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}
      headerAction={rockTypeToggle}>
      <FormProvider {...formMethods}>
        <BoreholesCard data-cy="lithology-basic-data" title={t("basicData")}>
          <FormContainer>
            <FormContainer direction={"row"}>
              <FormInput
                fieldName={"fromDepth"}
                label={"fromdepth"}
                required={true}
                value={lithology?.fromDepth}
                type={FormValueType.Number}
              />
              <FormInput
                fieldName={"toDepth"}
                label={"todepth"}
                required={true}
                value={lithology?.toDepth}
                type={FormValueType.Number}
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
        {lithology && isUnconsolidated === true && (
          <LithologyUnconsolidatedForm lithologyId={lithology.id} formMethods={formMethods} />
        )}
        {lithology && isUnconsolidated === false && (
          <LithologyConsolidatedForm lithologyId={lithology.id} formMethods={formMethods} />
        )}
        <BoreholesCard data-cy="lithology-notes" title={t("remarks")}>
          <RemarksFormSection fieldName="notes" label="remarks" />
        </BoreholesCard>
      </FormProvider>
    </FormDialog>
  );
};
