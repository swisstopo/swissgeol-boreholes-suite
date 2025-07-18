import { useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useReloadBoreholes } from "../../../../api/borehole.ts";
import { addCasing, updateCasing } from "../../../../api/fetchApiV2.js";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "../../../../components/dataCard/saveAndCancelButtons.js";
import { useUnsavedChangesPrompt } from "../../../../components/dataCard/useUnsavedChangesPrompt.js";
import { FormContainer, FormInput, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.js";
import { useFormDirtyChanges } from "../../../../components/form/useFormDirtyChanges.js";
import { useValidateFormOnMount } from "../../../../components/form/useValidateFormOnMount.js";
import { useBlockNavigation } from "../../../../hooks/useBlockNavigation.tsx";
import { extractCasingDepth } from "./casingUtils.jsx";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { prepareEntityDataForSubmit } from "./completionUtils.js";

const CasingInput = props => {
  const { t } = useTranslation();
  const { item, parentId } = props;
  const { triggerReload } = useContext(DataCardContext);
  const reloadBoreholes = useReloadBoreholes();

  useBlockNavigation();
  const formMethods = useForm({
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

  const prepareFormDataForSubmit = data => {
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

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addCasing({
        ...data,
      }).then(() => {
        triggerReload();
        reloadBoreholes();
      });
    } else {
      updateCasing({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  const updateDepth = () => {
    const depths = extractCasingDepth(getValues());
    if (depths.min !== getValues()["fromDepth"] || depths.max !== getValues()["toDepth"]) {
      setValue("fromDepth", formatNumberForDisplay(depths.min));
      setValue("toDepth", formatNumberForDisplay(depths.max));
    }
  };

  const addCasingElement = () => {
    const fieldArrayValues = getValues()["casingElements"];
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
  useFormDirtyChanges({ formState });

  useEffect(() => {
    trigger("casingElements");
    updateDepth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues()["casingElements"]]);

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(submitForm)}>
          <FormContainer>
            <FormInput fieldName="name" label="name" value={item.name} required={true} />
            <FormContainer direction="row">
              <FormInput fieldName="fromDepth" label="fromdepth" disabled={true} />
              <FormInput fieldName="toDepth" label="todepth" disabled={true} />
            </FormContainer>
            <FormContainer direction="row">
              <FormInput
                fieldName="dateStart"
                label="dateStartCasing"
                value={item.dateStart}
                type={FormValueType.Date}
              />
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
                .sort((a, b) => (a.fromDepth || Infinity) - (b.fromDepth || Infinity))
                .map((field, index) => (
                  <>
                    <Stack direction={"row"} key={field.id} marginTop="8px" data-cy={`casingElement-${index}`}>
                      <FormContainer>
                        <FormContainer direction="row">
                          <FormInput
                            fieldName={`casingElements.${index}.fromDepth`}
                            label="fromdepth"
                            value={field.fromDepth}
                            withThousandSeparator={true}
                            required={true}
                            onUpdate={updateDepth}
                          />
                          <FormInput
                            fieldName={`casingElements.${index}.toDepth`}
                            label="todepth"
                            value={field.toDepth}
                            withThousandSeparator={true}
                            required={true}
                            onUpdate={updateDepth}
                          />
                          <FormDomainSelect
                            fieldName={`casingElements.${index}.kindId`}
                            label="kindCasingLayer"
                            selected={field.kindId}
                            required={true}
                            schemaName={completionSchemaConstants.casingType}
                          />
                        </FormContainer>
                        <FormContainer direction="row">
                          <FormDomainSelect
                            fieldName={`casingElements.${index}.materialId`}
                            label="materialCasingLayer"
                            selected={field.materialId}
                            schemaName={completionSchemaConstants.casingMaterial}
                          />
                          <FormInput
                            fieldName={`casingElements.${index}.innerDiameter`}
                            label="casingInnerDiameter"
                            value={field.innerDiameter}
                            withThousandSeparator={true}
                          />
                          <FormInput
                            fieldName={`casingElements.${index}.outerDiameter`}
                            label="casingOuterDiameter"
                            value={field.outerDiameter}
                            withThousandSeparator={true}
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
    </>
  );
};

export default CasingInput;
