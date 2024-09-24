import { useContext, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { addFieldMeasurement, updateFieldMeasurement, useDomains } from "../../../../api/fetchApiV2";
import { AddButton, CancelButton, SaveButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import { DataCardContext, DataCardSwitchContext } from "../../../../components/dataCard/dataCardContext";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { getFieldMeasurementParameterUnits } from "./parameterUnits";

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
      fieldMeasurementResults: item?.fieldMeasurementResults || [
        { parameterId: "", value: null, minValue: null, maxValue: null },
      ],
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
        showPrompt(t("unsavedChangesMessage", { where: t("fieldMeasurement") }), [
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
        [index]: getFieldMeasurementParameterUnits(element.parameterId, domains.data),
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
    data = prepareCasingDataForSubmit(data);
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.fieldMeasurement;
    data.boreholeId = parentId;

    if (data.reliabilityId === "") {
      data.reliabilityId = null;
    }
    delete data.reliability;

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
    return data;
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <FormContainer>
            <ObservationInput observation={item} boreholeId={parentId} />
            <Box
              sx={{
                paddingBottom: "8.5px",
                marginRight: "8px !important",
                marginTop: "18px !important",
              }}>
              <FormContainer direction={"row"} justifyContent={"space-between"}>
                <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("fieldMeasurementResult")}</Typography>
                <AddButton
                  label="addFieldMeasurementResult"
                  onClick={() => {
                    append({ parameterId: "", value: null, minValue: null, maxValue: null }, { shouldFocus: false });
                  }}
                />
              </FormContainer>
              {fields.map((field, index) => (
                <FormContainer
                  direction={"row"}
                  key={field.id}
                  marginTop="8px"
                  data-cy={`fieldMeasurementResult-${index}`}>
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
                      setUnits({ ...units, [index]: getFieldMeasurementParameterUnits(value, domains.data) });
                    }}
                  />

                  <FormInput
                    fieldName={`fieldMeasurementResults.${index}.value`}
                    label="value"
                    value={field.value}
                    type={FormValueType.Number}
                    required={true}
                    inputProps={{
                      endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
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
                </FormContainer>
              ))}
            </Box>
          </FormContainer>
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
