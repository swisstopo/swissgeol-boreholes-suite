import { FC, useContext, useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Info, Sparkles } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { BoreholesButton } from "../../../../../../components/buttons/buttons.tsx";
import { FieldAnalysisProvider } from "../../../../../../components/form/fieldAnalysis/fieldAnalysisContext.tsx";
import { FormErrors, FormValueType } from "../../../../../../components/form/form.ts";
import { FormContainer } from "../../../../../../components/form/formContainer.tsx";
import { FormDialog } from "../../../../../../components/form/formDialog.tsx";
import { FormInput } from "../../../../../../components/form/formInput.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { useCapitalizedTranslation } from "../../../../../../hooks/useCapitalizedTranslation.ts";
import { useDevMode } from "../../../../../../hooks/useDevMode.tsx";
import { LithologicalDescription, Lithology, LithologyFormValues } from "../../stratigraphy.ts";
import { AnalysisResultCard } from "../analysis/analysisResultCard.tsx";
import { useLithologyAnalysis } from "../analysis/useLithologyAnalysis.ts";
import { LithologyConsolidatedForm } from "./lithologyConsolidatedForm.tsx";
import { LithologyUnconsolidatedForm } from "./lithologyUnconsolidatedForm.tsx";
import {
  buildApplyHandler,
  buildLithologicalDescription,
  buildLithologyValuesForMode,
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
  const { formState, getValues, subscribe } = formMethods;
  const { showPrompt } = useContext(PromptContext);
  const { showAlert } = useContext(AlertContext);
  const { runsDevMode } = useDevMode();
  const analysis = useLithologyAnalysis(formMethods);
  const sharedLithologyCount = lithologicalDescription?.depthIds?.length ?? 0;

  // A field the user edits by hand is their value, not the analysis's, so its row is resolved.
  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ name, type }) => {
        if (type === "change" && name && analysis.changeByPath.has(name)) {
          analysis.acceptField(name);
        }
      },
    });
  }, [analysis, subscribe]);

  // The form needs the optional flags resolved and at least one description row. Deriving a copy
  // keeps the prop untouched while the change detection below still compares against this shape.
  const normalizedLithology = useMemo(() => {
    if (!lithology) return lithology;

    return {
      ...lithology,
      hasBedding: lithology.hasBedding === undefined ? false : lithology.hasBedding,
      isUnconsolidated: lithology.isUnconsolidated === undefined ? true : lithology.isUnconsolidated,
      // Add first lithology description if not present
      lithologyDescriptions: lithology.lithologyDescriptions ?? [
        {
          id: 0,
          lithologyId: lithology.id,
          isFirst: true,
        },
      ],
    };
  }, [lithology]);

  useEffect(() => {
    if (normalizedLithology) {
      formMethods.reset({
        ...normalizedLithology,
        lithologicalDescription: { description: lithologicalDescription?.description ?? "" },
      });
    }
  }, [normalizedLithology, lithologicalDescription, formMethods]);

  const isUnconsolidated = useWatch({ control: formMethods.control, name: "isUnconsolidated" });

  const cancelDialog = () => {
    updateLithology(normalizedLithology as Lithology, false);
  };

  const applyLithology = async () => {
    const values = getValues();
    const isValid = await formMethods.trigger();

    const descriptionValue = (values.lithologicalDescription?.description ?? "").trim();
    const originalDescription = lithologicalDescription?.description ?? "";
    const lithologicalDescriptionChanged = descriptionValue !== originalDescription;

    const lithologyValues = { ...values };
    prepareLithologyForSubmit(lithologyValues);

    const lithologyHasChanges = JSON.stringify(normalizedLithology) !== JSON.stringify(lithologyValues);
    if (!lithologyHasChanges && !lithologicalDescriptionChanged) {
      updateLithology(normalizedLithology as Lithology, false);
      return;
    }
    if (!isValid) return;

    const updateLithologyWithLithologicalDesciption = () => {
      const merged = { ...normalizedLithology, ...lithologyValues } as Lithology;
      updateLithology(merged, lithologyHasChanges || (Boolean(normalizedLithology?.isGap) && isValid));
      if (
        lithologicalDescriptionChanged &&
        (lithologicalDescription || (normalizedLithology?.depthIds?.length ?? 0) > 0)
      ) {
        updateLithologicalDescription(
          buildLithologicalDescription(lithologicalDescription, normalizedLithology as Lithology, descriptionValue),
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

  const applyDialog = buildApplyHandler(analysis, applyLithology, showPrompt);

  const description = useWatch({ control: formMethods.control, name: "lithologicalDescription.description" });

  const runAnalysis = async () => {
    try {
      const pending = await analysis.run((description ?? "").trim());
      if (pending === 0) showAlert(t("lithologyClassificationNoResult"), "info");
    } catch {
      showAlert(t("errorLithologyClassification"), "error");
    }
  };

  // The tab the analysis switched to carries the same highlight as the fields it wrote, so the
  // mode change is visible where the user chose the mode, not only in the result card.
  const renderModeToggleButton = (
    value: RockTypeToggleValue,
    label: "unconsolidated" | "consolidated" | "unspecified",
  ) => {
    const isAnalysisTarget = analysis.modeChange?.next === (value === "unspecified" ? null : value);

    return (
      <ToggleButton
        value={value}
        sx={
          isAnalysisTarget
            ? {
                border: `2px solid ${theme.palette.ai.highlightBorder} !important`,
                backgroundColor: theme.palette.ai.highlightBackground,
              }
            : undefined
        }>
        <Stack direction="row" gap={0.5} alignItems="center">
          {isAnalysisTarget && (
            <Box
              component="span"
              data-cy="analysis-mode-badge"
              sx={{
                display: "inline-flex",
                borderRadius: "50%",
                backgroundColor: theme.palette.ai.highlightBorder,
                color: theme.palette.warning.main,
                p: "2px",
              }}>
              <Info size={12} />
            </Box>
          )}
          <Typography>{ct(label)}</Typography>
        </Stack>
      </ToggleButton>
    );
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
                    formMethods.reset(buildLithologyValuesForMode(formMethods.getValues(), newValue));
                    analysis.discard();
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
          {renderModeToggleButton(true, "unconsolidated")}
          {renderModeToggleButton(false, "consolidated")}
          {renderModeToggleButton("unspecified", "unspecified")}
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
        <FieldAnalysisProvider changeByPath={analysis.changeByPath} onResetField={analysis.resetField}>
          <BoreholesCard data-cy="lithology-basic-data" title={t("basicData")}>
            <FormContainer>
              <FormContainer direction={"row"}>
                <FormInput
                  fieldName={"fromDepth"}
                  label={"fromDepth"}
                  readonly={true}
                  value={lithology?.fromDepth}
                  type={FormValueType.Number}
                />
                <FormInput
                  fieldName={"toDepth"}
                  label={"toDepth"}
                  readonly={true}
                  value={lithology?.toDepth}
                  type={FormValueType.Number}
                />
              </FormContainer>
            </FormContainer>
          </BoreholesCard>
          <BoreholesCard
            data-cy="lithology-lithological-description"
            title={t("lithologyLayerDescription")}
            action={
              // Gated on dev mode while the classification is served from the client side mock.
              // Drop the gate together with useClassificationMock once the endpoint ships.
              runsDevMode && (
                <BoreholesButton
                  variant="contained"
                  color="primary"
                  label="analyze"
                  data-cy="analyze-description-button"
                  icon={analysis.isPending ? <CircularProgress size={16} color="inherit" /> : <Sparkles />}
                  disabled={analysis.isPending || (description ?? "").trim().length === 0}
                  onClick={runAnalysis}
                />
              )
            }>
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
                <AnalysisResultCard analysis={analysis} />
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
        </FieldAnalysisProvider>
      </FormProvider>
    </FormDialog>
  );
};
