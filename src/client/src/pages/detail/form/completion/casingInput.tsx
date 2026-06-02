import { useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useReloadBoreholes } from "../../../../api/borehole.ts";
import { addCasing, updateCasing } from "../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "../../../../components/dataCard/saveAndCancelButtons.tsx";
import { useUnsavedChangesPrompt } from "../../../../components/dataCard/useUnsavedChangesPrompt.tsx";
import { FormContainer, FormInput, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { useFormDirtyMarkAsChanged } from "../../../../components/form/useFormDirty.tsx";
import { useValidateFormOnMount } from "../../../../components/form/useValidateFormOnMount.tsx";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { extractCasingDepth } from "./casingUtils.tsx";
import { Casing, CasingElement, DataCardItemInputProps } from "./completionInterfaces.ts";
import { completionSchemaConstants } from "./completionSchemaConstants.ts";
import { prepareEntityDataForSubmit } from "./completionUtils.ts";

interface CasingFormValues {
  name?: string;
  fromDepth?: string | number | null;
  toDepth?: string | number | null;
  dateStart?: string | null;
  dateFinish?: string | null;
  notes?: string;
  completionId?: number;
  casingElements: CasingElement[];
}

const CasingInput = ({ item, parentId }: DataCardItemInputProps<Casing>) => {
  const { t } = useTranslation();
  const { triggerReload } = useContext(DataCardContext);
  const reloadBoreholes = useReloadBoreholes();
  const resetTabStatus = useResetTabStatus(["casing"]);

  const formMethods = useForm<CasingFormValues>({
    mode: "all",
    defaultValues: {
      casingElements: item?.casingElements || [
        { fromDepth: null, toDepth: null, kindId: "", materialId: "", innerDiameter: null, outerDiameter: null },
      ],
    },
  });
  const { formState, handleSubmit, control, getValues, setValue, trigger } = formMethods;
  const { fields, append, remove } = useFieldArray({
    name: "casingElements",
    control: control,
    rules: {
      required: true,
    },
  });

  const prepareFormDataForSubmit = (data: CasingFormValues): CasingFormValues => {
    data = prepareEntityDataForSubmit(data, parentId);
    if (data?.dateStart === "") {
      data.dateStart = null;
    }
    if (data?.dateFinish === "") {
      data.dateFinish = null;
    }

    data.casingElements = data.casingElements.map(element => {
      return {
        ...element,
        materialId: element.materialId === "" ? null : element.materialId,
        innerDiameter: parseFloatWithThousandsSeparator(element.innerDiameter),
        outerDiameter: parseFloatWithThousandsSeparator(element.outerDiameter),
        fromDepth: parseFloatWithThousandsSeparator(element.fromDepth),
        toDepth: parseFloatWithThousandsSeparator(element.toDepth),
      };
    });
    return data;
  };

  const submitForm = (data: CasingFormValues) => {
    resetTabStatus();
    data = prepareFormDataForSubmit(data);
    const payload = { ...item, ...data } as unknown as Casing;
    if (item.id === 0) {
      addCasing(payload).then(() => {
        triggerReload();
        reloadBoreholes();
      });
    } else {
      updateCasing(payload).then(() => {
        triggerReload();
      });
    }
  };

  const updateDepth = () => {
    const values = getValues();
    const depths = extractCasingDepth(values);
    if (depths.min !== values.fromDepth || depths.max !== values.toDepth) {
      setValue("fromDepth", formatNumberForDisplay(depths.min));
      setValue("toDepth", formatNumberForDisplay(depths.max));
    }
  };

  const addCasingElement = () => {
    const fieldArrayValues = getValues().casingElements;
    append(
      {
        fromDepth: fieldArrayValues[fieldArrayValues.length - 1].toDepth,
        toDepth: null,
        kindId: "",
        materialId: "",
        innerDiameter: null,
        outerDiameter: null,
      },
      { shouldFocus: false },
    );
  };

  useUnsavedChangesPrompt({
    formMethods,
    submitForm,
    translationKey: "casing",
  });

  useValidateFormOnMount({ formMethods });
  useFormDirtyMarkAsChanged({ formState });

  useEffect(() => {
    trigger("casingElements");
    updateDepth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues().casingElements]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submitForm)}>
        <FormContainer>
          <FormInput fieldName="name" label="name" value={item.name} required={true} />
          <FormContainer direction="row">
            <FormInput fieldName="fromDepth" label="fromdepth" disabled={true} />
            <FormInput fieldName="toDepth" label="todepth" disabled={true} />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput fieldName="dateStart" label="dateStartCasing" value={item.dateStart} type={FormValueType.Date} />
            <FormInput
              fieldName="dateFinish"
              label="dateFinishCasing"
              value={item.dateFinish}
              type={FormValueType.Date}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
          </FormContainer>
          <Box
            sx={{
              paddingBottom: "8.5px",
              marginRight: "8px !important",
              marginTop: "18px !important",
            }}>
            <FormContainer direction={"row"} justifyContent={"space-between"}>
              <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("casingElements")}</Typography>
              <AddButton
                label="addCasingElement"
                onClick={() => {
                  addCasingElement();
                }}
              />
            </FormContainer>
            {fields
              .sort((a, b) => (a.fromDepth ?? Infinity) - (b.fromDepth ?? Infinity))
              .map((field, index) => (
                <>
                  <Stack direction={"row"} key={field.id} marginTop="8px" data-cy={`casingElement-${index}`}>
                    <FormContainer>
                      <FormContainer direction="row">
                        <FormInput
                          fieldName={`casingElements.${index}.fromDepth`}
                          label="fromdepth"
                          value={field.fromDepth}
                          type={FormValueType.Number}
                          required={true}
                          onUpdate={updateDepth}
                        />
                        <FormInput
                          fieldName={`casingElements.${index}.toDepth`}
                          label="todepth"
                          value={field.toDepth}
                          type={FormValueType.Number}
                          required={true}
                          onUpdate={updateDepth}
                        />
                        <FormDomainSelect
                          fieldName={`casingElements.${index}.kindId`}
                          label="kindCasingLayer"
                          selected={typeof field.kindId === "number" ? field.kindId : null}
                          required={true}
                          schemaName={completionSchemaConstants.casingType}
                        />
                      </FormContainer>
                      <FormContainer direction="row">
                        <FormDomainSelect
                          fieldName={`casingElements.${index}.materialId`}
                          label="materialCasingLayer"
                          selected={typeof field.materialId === "number" ? field.materialId : null}
                          schemaName={completionSchemaConstants.casingMaterial}
                        />
                        <FormInput
                          fieldName={`casingElements.${index}.innerDiameter`}
                          label="casingInnerDiameter"
                          value={field.innerDiameter}
                          type={FormValueType.Number}
                        />
                        <FormInput
                          fieldName={`casingElements.${index}.outerDiameter`}
                          label="casingOuterDiameter"
                          value={field.outerDiameter}
                          type={FormValueType.Number}
                        />
                      </FormContainer>
                    </FormContainer>
                    <IconButton
                      onClick={() => remove(index)}
                      data-cy={`casingElements.${index}.delete`}
                      disabled={fields.length === 1}
                      color="error"
                      sx={{ marginTop: "10px !important" }}>
                      <Delete />
                    </IconButton>
                  </Stack>
                  {index < fields.length - 1 && <Divider sx={{ marginTop: "15px" }} />}
                </>
              ))}
          </Box>
        </FormContainer>
        <DataCardSaveAndCancelButtons formMethods={formMethods} submitForm={submitForm} />
      </form>
    </FormProvider>
  );
};

export default CasingInput;
