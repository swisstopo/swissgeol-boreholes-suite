import React, { useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import { AddButton, CancelButton, SaveButton } from "../../../../components/buttons/buttons";
import { extractCasingDepth } from "./casingDepthExtraction.jsx";

const CasingInput = props => {
  const { item, setSelected, parentId, addData, updateData } = props;
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({
    defaultValues: {
      casingElements: item?.casingElements || [],
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
      addData({
        ...data,
      });
    } else {
      updateData({
        ...item,
        ...data,
      });
    }
  };

  const closeFormIfCompleted = () => {
    if (formMethods.formState.isValid) {
      formMethods.handleSubmit(submitForm)();
      setSelected(null);
    }
  };

  const updateDepth = () => {
    var depths = extractCasingDepth(formMethods.getValues());

    if (depths.min !== formMethods.getValues()["fromDepth"] || depths.max !== formMethods.getValues()["toDepth"]) {
      formMethods.setValue("fromDepth", depths.min || 0);
      formMethods.setValue("toDepth", depths.max || 0);
    }
  };

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  useEffect(() => {
    var casingElements = formMethods.getValues()["casingElements"];
    if (casingElements.length === 0) {
      append();
    }
    updateDepth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["casingElements"]]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
          <FormInput fieldName="name" label="casingName" value={item.name} required={true} />
          <Stack direction="row">
            <FormInput fieldName="fromDepth" label="fromdepth" value={item.fromDepth} type="number" disabled={true} />
            <FormInput fieldName="toDepth" label="todepth" value={item.toDepth} type="number" disabled={true} />
          </Stack>
          <Stack direction="row">
            <FormInput fieldName="dateStart" label="dateStartCasing" value={item.dateStart} type="date" />
            <FormInput fieldName="dateFinish" label="dateFinishCasing" value={item.dateFinish} type="date" />
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
                  append();
                }}
              />
            </Stack>
            {fields
              .sort((a, b) => a.fromDepth - b.fromDepth)
              .map((field, index) => (
                <Stack direction={"row"} key={field.id} marginTop="8px" data-cy={`casingElement-${index}`}>
                  <FormInput
                    fieldName={`casingElements.${index}.fromDepth`}
                    label="fromdepth"
                    value={field.fromDepth}
                    type="number"
                    required={true}
                    onUpdate={updateDepth}
                  />
                  <FormInput
                    fieldName={`casingElements.${index}.toDepth`}
                    label="todepth"
                    value={field.toDepth}
                    type="number"
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
                    type="number"
                  />
                  <FormInput
                    fieldName={`casingElements.${index}.outerDiameter`}
                    label="casingOuterDiameter"
                    value={field.outerDiameter}
                    type="number"
                  />
                  <IconButton
                    onClick={() => remove(index)}
                    data-cy={`casingElements.${index}.delete`}
                    disabled={fields.length === 1}
                    color="error"
                    sx={{ marginTop: "10px !important" }}>
                    <Delete />
                  </IconButton>
                </Stack>
              ))}
          </Box>
        </Stack>
        <DataCardButtonContainer>
          <CancelButton
            onClick={() => {
              formMethods.reset();
              setSelected(null);
            }}
          />
          <SaveButton
            disabled={!formMethods.formState.isValid}
            onClick={() => {
              closeFormIfCompleted();
            }}
          />
        </DataCardButtonContainer>
      </form>
    </FormProvider>
  );
};

const MemoizedCasingInput = React.memo(CasingInput);
export default MemoizedCasingInput;
