import { FC, useContext, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Info } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { FormErrors, FormValueType } from "../../../../../../components/form/form.ts";
import { FormContainer } from "../../../../../../components/form/formContainer.tsx";
import { FormDialog } from "../../../../../../components/form/formDialog.tsx";
import { FormInput } from "../../../../../../components/form/formInput.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { useCapitalizedTranslation } from "../../../../../../hooks/useCapitalizedTranslation.ts";
import { LithologicalDescription, Lithology, LithologyFormValues } from "../../stratigraphy.ts";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";
import {
  buildLithologicalDescription,
  prepareLithologyForSubmit,
  validateLithologyUnconValues,
} from "./lithologyUtils.ts";
import { RemarksFormSection } from "./remarksFormSection.tsx";

interface LithologyEditModalProps {
  lithology: Lithology | undefined;
  lithologicalDescription: LithologicalDescription | undefined;
  updateLithology: (lithology: Lithology, hasChanges: boolean) => void;
  updateLithologicalDescription: (description: LithologicalDescription, hasChanges: boolean) => void;
}

type RockTypeToggleValue = boolean | "unspecified";

const labelKey = (value: boolean | null | "unspecified"): "unconsolidated" | "consolidated" | "unspecified" => {
  if (value === true) return "unconsolidated";
  if (value === false) return "consolidated";
  return "unspecified";
};

export const LithologyModal: FC<LithologyEditModalProps> = ({
  lithology,
  lithologicalDescription,
  updateLithology,
  updateLithologicalDescription,
}) => {
  const { t } = useTranslation();
  const ct = useCapitalizedTranslation();
  const formMethods = useForm<LithologyFormValues>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      validateLithologyUnconValues(values.lithologyDescriptions, errors, values.isUnconsolidated);
      if (Object.keys(errors).length > 0) {
        return { values: {}, errors };
      }
      return { values, errors: {} };
    },
  });
  const { formState, getValues } = formMethods;
  const { showPrompt } = useContext(PromptContext);
  const sharedLithologyCount = lithologicalDescription?.depthIds?.length ?? 0;

  useEffect(() => {
    if (lithology) {
      if (lithology.hasBedding === undefined) lithology.hasBedding = false;
      if (lithology.isUnconsolidated === undefined) lithology.isUnconsolidated = true;

      // Add first lithology description if not present
      if (!lithology?.lithologyDescriptions) {
        lithology.lithologyDescriptions = [
          {
            id: 0,
            lithologyId: lithology.id,
            isFirst: true,
          },
        ];
      }

      formMethods.reset({
        ...lithology,
        lithologicalDescription: { description: lithologicalDescription?.description ?? "" },
      });
    }
  }, [lithology, lithologicalDescription, formMethods]);

  const isUnconsolidated = formMethods.watch("isUnconsolidated");

  const cancelDialog = () => {
    updateLithology(lithology as Lithology, false);
  };

  const applyDialog = async () => {
    const values = getValues();
    const isValid = await formMethods.trigger();

    const descriptionValue = (values.lithologicalDescription?.description ?? "").trim();
    const originalDescription = lithologicalDescription?.description ?? "";
    const lithologicalDescriptionChanged = descriptionValue !== originalDescription;

    const lithologyValues = { ...values };
    prepareLithologyForSubmit(lithologyValues);

    const lithologyHasChanges = JSON.stringify(lithology) !== JSON.stringify(lithologyValues);
    if (!lithologyHasChanges && !lithologicalDescriptionChanged) {
      updateLithology(lithology as Lithology, false);
      return;
    }
    if (!isValid) return;

    const updateLithologyWithLithologicalDesciption = () => {
      const merged = { ...lithology, ...lithologyValues } as Lithology;
      updateLithology(merged, lithologyHasChanges || (Boolean(lithology?.isGap) && isValid));
      if (lithologicalDescriptionChanged && (lithologicalDescription || (lithology?.depthIds?.length ?? 0) > 0)) {
        updateLithologicalDescription(
          buildLithologicalDescription(lithologicalDescription, lithology as Lithology, descriptionValue),
          true,
        );
      }
    };

    if (lithologicalDescriptionChanged && sharedLithologyCount > 1) {
      showPrompt(t("confirmEditSharedLithologicalDescription", { count: sharedLithologyCount }), [
        { label: "cancel", action: () => {} },
        { label: "continue", variant: "contained", action: updateLithologyWithLithologicalDesciption },
      ]);
    } else {
      updateLithologyWithLithologicalDesciption();
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
                { label: "cancel", action: () => {} },
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
                      lithologyDescriptions:
                        newValue === null
                          ? []
                          : [
                              {
                                id: 0,
                                lithologyId: currentValues.id,
                                isFirst: true,
                              },
                            ],
                      notes: currentValues.notes,
                      lithologicalDescription: {
                        description: currentValues.lithologicalDescription?.description ?? "",
                      },
                    });
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
            <Typography>{ct("unconsolidated")}</Typography>
          </ToggleButton>
          <ToggleButton value={false}>
            <Typography>{ct("consolidated")}</Typography>
          </ToggleButton>
          <ToggleButton value="unspecified">
            <Typography>{ct("unspecified")}</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    />
  );

  return (
    <FormDialog
      open={lithology !== undefined}
      title={t("lithology")}
      onClose={cancelDialog}
      onApply={applyDialog}
      isApplyDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}
      headerAction={rockTypeToggle}>
      <FormProvider {...formMethods}>
        <BoreholesCard data-cy="lithology-basic-data" title={t("basicData")}>
          <FormContainer>
            <FormContainer direction={"row"}>
              <FormInput
                fieldName={"fromDepth"}
                label={"fromdepth"}
                readonly={true}
                value={lithology?.fromDepth}
                type={FormValueType.Number}
              />
              <FormInput
                fieldName={"toDepth"}
                label={"todepth"}
                readonly={true}
                value={lithology?.toDepth}
                type={FormValueType.Number}
              />
            </FormContainer>
          </FormContainer>
        </BoreholesCard>
        <BoreholesCard data-cy="lithology-lithological-description" title={t("lithologyLayerDescription")}>
          <FormContainer>
            <Stack gap={1}>
              <FormInput
                fieldName="lithologicalDescription.description"
                label="description"
                multiline={true}
                rows={3}
              />
              {sharedLithologyCount > 1 && (
                <Stack direction="row" sx={{ color: theme.palette.primary.main }} gap={1}>
                  <Info />
                  <Typography variant="h6" data-cy="shared-lithological-description-notice">
                    {t("sharedLithologicalDescriptionNotice", { count: sharedLithologyCount })}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </FormContainer>
        </BoreholesCard>
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
