import { useContext, useState, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Box, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import { AddButton, CancelButton, SaveButton } from "../../../../components/buttons/buttons";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import { useDomains, addFieldMeasurement, updateFieldMeasurement } from "../../../../api/fetchApiV2";
import { DataCardContext, DataCardSwitchContext } from "../../../../components/dataCard/dataCardContext";
import { PromptContext } from "../../../../components/prompt/promptContext";
import { useTranslation } from "react-i18next";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { getFieldMeasurementParameterUnits } from "./parameterUnits";
import Delete from "@mui/icons-material/Delete";
const FieldMeasurementInput = props => {
  const { item, parentId } = props;
  const { triggerReload, selectCard } = useContext(DataCardContext);
  const { checkIsDirty, leaveInput } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({
    mode: "all",
    defaultValues: {
      fieldMeasurementResults: item?.fieldMeasurementResults || [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "fieldMeasurementResults",
    control: formMethods.control,
  });
  const [units, setUnits] = useState({});

  useEffect(() => {
    if (checkIsDirty) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesTitle", { where: t("fieldMeasurement") }), t("unsavedChangesMessage"), [
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
    formMethods.trigger("fieldMeasurementResults");
    var currentUnits = {};
    formMethods.getValues()["fieldMeasurementResults"].forEach((element, index) => {
      currentUnits = {
        ...currentUnits,
        [index]: getFieldMeasurementParameterUnits(element.parameterId),
      };
    });
    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["fieldMeasurementResults"]]);

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addFieldMeasurement({
        ...data,
      }).then(() => {
        triggerReload();
      });
    } else {
      updateFieldMeasurement({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  const prepareFormDataForSubmit = data => {
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.fieldMeasurement;
    data.boreholeId = parentId;

    if (data.fieldMeasurementResults) {
      data.fieldMeasurementResults = data.fieldMeasurementResults.map(r => {
        return {
          id: r.id,
          sampleTypeId: r.sampleTypeId,
          parameterId: r.parameterId,
          value: r.value,
        };
      });
    }

    if (data.casingId == null) {
      data.casingId = item.casingId;
    } else if (data.casingId === "") {
      data.casingId = null;
    }
    data.casing = null;
    return data;
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <ObservationInput observation={item} boreholeId={parentId} />
            {formMethods.getValues().reliabilityId && formMethods.getValues().startTime && (
              <Box
                sx={{
                  paddingBottom: "8.5px",
                  marginRight: "8px !important",
                  marginTop: "18px !important",
                }}>
                <Stack direction={"row"} sx={{ width: "100%" }} spacing={1} justifyContent={"space-between"}>
                  <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("fieldMeasurementResult")}</Typography>
                  <AddButton
                    label="addFieldmeasurementResult"
                    onClick={() => {
                      append({ parameterId: "", value: null, minValue: null, maxValue: null }, { shouldFocus: false });
                    }}
                  />
                </Stack>
                {fields.map((field, index) => (
                  <Stack direction={"row"} key={field.id} marginTop="8px" data-cy={`fieldMeasurementResult-${index}`}>
                    <FormSelect
                      fieldName={`fieldMeasurementResults.${index}.sampleTypeId`}
                      label="fieldMeasurementSampleType"
                      selected={field.sampleTypeId}
                      required={true}
                      values={domains?.data
                        ?.filter(d => d.schema === hydrogeologySchemaConstants.fieldMeasurementSampleType)
                        .sort((a, b) => a.order - b.order)
                        .map(d => ({
                          key: d.id,
                          name: d[i18n.language],
                        }))}
                    />
                    <FormSelect
                      fieldName={`fieldMeasurementResults.${index}.parameterId`}
                      label="parameter"
                      selected={field.parameterId}
                      required={true}
                      values={domains?.data
                        ?.filter(d => d.schema === hydrogeologySchemaConstants.fieldMeasurementParameter)
                        .sort((a, b) => a.order - b.order)
                        .map(d => ({
                          key: d.id,
                          name: d[i18n.language],
                        }))}
                      onUpdate={value => {
                        setUnits({ ...units, [index]: getFieldMeasurementParameterUnits(value) });
                      }}
                    />

                    <FormInput
                      fieldName={`fieldMeasurementResults.${index}.value`}
                      label="value"
                      value={field.value}
                      type="number"
                      required={true}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>
                        ),
                      }}
                    />
                    <IconButton
                      onClick={() => remove(index)}
                      color="error"
                      sx={{
                        marginTop: "10px !important",
                      }}>
                      <Delete />
                    </IconButton>
                  </Stack>
                ))}
              </Box>
            )}
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

export default FieldMeasurementInput;
