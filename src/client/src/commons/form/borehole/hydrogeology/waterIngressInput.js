import React, { useEffect, useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Stack, Tooltip } from "@mui/material";
import { FormSelect } from "../../../../components/form/form";
import { useDomains } from "../../../../api/fetchApiV2";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../../../../components/alert/alertContext";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";

const WaterIngressInput = props => {
  const { item, setSelected, parentId, addData, updateData } = props;
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm();
  const alertContext = useContext(AlertContext);

  // submit values on unmount with useEffect clean up function.
  useEffect(() => {
    return () => {
      formMethods.handleSubmit(submitForm)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.handleSubmit]);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const submitForm = data => {
    //convert dates to IsoStrings
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    if (data.startTime && data.quantityId && data.reliabilityId) {
      if (item.id === 0) {
        addData({
          ...data,
          type: ObservationType.waterIngress,
          boreholeId: parentId,
        });
      } else {
        delete item.casing;
        delete item.quantity;
        delete item.reliability;
        updateData({ ...item, ...data });
      }
    } else {
      setSelected(null);
    }
  };

  const closeFormIfCompleted = () => {
    const formValues = formMethods.getValues();
    if (
      !formValues.reliabilityId ||
      !formValues.quantityId ||
      !formValues.startTime
    ) {
      alertContext.error(t("waterIngressRequiredFieldsAlert"));
    } else {
      setSelected(null);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <ObservationInput observation={item} boreholeId={parentId} />
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormSelect
                fieldName="quantityId"
                label="quantity"
                selected={item.quantityId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      hydrogeologySchemaConstants.waterIngressQuantity,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
              <FormSelect
                fieldName="conditionsId"
                label="conditions"
                selected={item.conditionsId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      hydrogeologySchemaConstants.waterIngressConditions,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
            </Stack>
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("close")}>
              <CheckIcon
                sx={{
                  color: formMethods.formState.isValid
                    ? "#0080008c"
                    : "disabled",
                }}
                data-cy="close-icon"
                onClick={() => closeFormIfCompleted()}
              />
            </Tooltip>
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default WaterIngressInput;
