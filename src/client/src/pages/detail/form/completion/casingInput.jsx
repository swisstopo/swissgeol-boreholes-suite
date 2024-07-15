import { useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { StackFullWidth } from "../../../../components/styledComponents.ts";
import Delete from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { addCasing, updateCasing, useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import { AddButton, CancelButton, SaveButton } from "../../../../components/buttons/buttons.tsx";
import { extractCasingDepth } from "./casingUtils.jsx";
import { DataCardContext, DataCardSwitchContext } from "../../../../components/dataCard/dataCardContext.jsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";

const CasingInput = props => {
  const { item, parentId } = props;
  const { triggerReload, selectCard } = useContext(DataCardContext);
  const { checkIsDirty, leaveInput } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({
    mode: "all",
    defaultValues: {
      casingElements: item?.casingElements || [
        { fromDepth: null, toDepth: null, kindId: "", materialId: "", innerDiameter: null, outerDiameter: null },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "casingElements",
    control: formMethods.control,
    rules: {
      required: true,
    },
  });

  const prepareFormDataForSubmit = data => {
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
        innerDiameter: element.innerDiameter === "" ? null : element.innerDiameter,
        outerDiameter: element.outerDiameter === "" ? null : element.outerDiameter,
      };
    });
    data.completionId = parentId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addCasing({
        ...data,
      }).then(() => {
        triggerReload();
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
    var depths = extractCasingDepth(formMethods.getValues());

    if (depths.min !== formMethods.getValues()["fromDepth"] || depths.max !== formMethods.getValues()["toDepth"]) {
      formMethods.setValue("fromDepth", depths.min || 0);
      formMethods.setValue("toDepth", depths.max || 0);
    }
  };

  const addCasingElement = () => {
    const fieldArrayValues = formMethods.getValues()["casingElements"];
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

  useEffect(() => {
    if (checkIsDirty) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesMessage", { where: t("casing") }), [
          {
            label: t("cancel"),
            action: () => {
              leaveInput(false);
            },
          },
          {
            label: t("reset"),
            action: () => {
              formMethods.reset();
              selectCard(null);
              leaveInput(true);
            },
          },
          {
            label: t("save"),
            disabled: !formMethods.formState.isValid,
            action: () => {
              formMethods.handleSubmit(submitForm)();
            },
          },
        ]);
      } else {
        leaveInput(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIsDirty]);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  useEffect(() => {
    formMethods.trigger("casingElements");
    updateDepth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["casingElements"]]);

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <FormInput fieldName="name" label="name" value={item.name} required={true} />
            <Stack direction="row">
              <FormInput
                fieldName="fromDepth"
                label="fromdepth"
                value={item.fromDepth}
                type={FormValueType.Number}
                disabled={true}
              />
              <FormInput
                fieldName="toDepth"
                label="todepth"
                value={item.toDepth}
                type={FormValueType.Number}
                disabled={true}
              />
            </Stack>
            <Stack direction="row">
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
            </Stack>
            <Stack direction="row">
              <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
            </Stack>
            <Box
              sx={{
                paddingBottom: "8.5px",
                marginRight: "8px !important",
                marginTop: "18px !important",
              }}>
              <Stack direction={"row"} sx={{ width: "100%" }} spacing={1} justifyContent={"space-between"}>
                <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("casingElements")}</Typography>
                <AddButton
                  label="addCasingElement"
                  onClick={() => {
                    addCasingElement();
                  }}
                />
              </Stack>
              {fields
                .sort((a, b) => (a.fromDepth || Infinity) - (b.fromDepth || Infinity))
                .map((field, index) => (
                  <>
                    <Stack direction={"row"} key={field.id} marginTop="8px" data-cy={`casingElement-${index}`}>
                      <StackFullWidth direction={"column"} spacing={1}>
                        <StackFullWidth direction="row">
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
                          <FormSelect
                            fieldName={`casingElements.${index}.kindId`}
                            label="kindCasingLayer"
                            selected={field.kindId}
                            required={true}
                            values={domains?.data
                              ?.filter(d => d.schema === completionSchemaConstants.casingType)
                              .sort((a, b) => a.order - b.order)
                              .map(d => ({
                                key: d.id,
                                name: d[i18n.language],
                              }))}
                          />
                        </StackFullWidth>
                        <StackFullWidth direction="row">
                          <FormSelect
                            fieldName={`casingElements.${index}.materialId`}
                            label="materialCasingLayer"
                            selected={field.materialId}
                            values={domains?.data
                              ?.filter(d => d.schema === completionSchemaConstants.casingMaterial)
                              .sort((a, b) => a.order - b.order)
                              .map(d => ({
                                key: d.id,
                                name: d[i18n.language],
                              }))}
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
                        </StackFullWidth>
                      </StackFullWidth>
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
          </Stack>
          <DataCardButtonContainer>
            <CancelButton
              onClick={() => {
                formMethods.reset();
                selectCard(null);
              }}
            />
            <SaveButton
              disabled={!formMethods.formState.isValid}
              onClick={() => {
                formMethods.handleSubmit(submitForm)();
              }}
            />
          </DataCardButtonContainer>
        </form>
      </FormProvider>
    </>
  );
};

export default CasingInput;
