import { FC, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Chip, Stack } from "@mui/material";
import { BoreholesCard } from "../../../../components/boreholesCard.tsx";
import { useCodelists } from "../../../../components/codelist.ts";
import {
  FormContainer,
  FormDialog,
  FormDomainSelect,
  FormErrors,
  FormInput,
  FormValueType,
} from "../../../../components/form/form.ts";
import { validateDepths } from "../../../../components/form/formUtils.ts";
import { useFormDirty } from "../../../../components/form/useFormDirty.tsx";
import { TmpLogRun } from "./log.ts";
import { getServiceOrToolArray, validateRunNumber } from "./logUtils.ts";

interface LogRunModalProps {
  logRun: TmpLogRun | undefined;
  updateLogRun: (logRun: TmpLogRun, hasChanges: boolean) => void;
}

export const LogRunModal: FC<LogRunModalProps> = ({ logRun, updateLogRun }) => {
  const { t } = useTranslation();
  const { data: codelists } = useCodelists();

  const formMethods = useForm<TmpLogRun>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      validateDepths(values, errors);
      validateRunNumber(values, errors);
      return { values, errors };
    },
  });
  const { formState, getValues } = formMethods;
  const isDirty = useFormDirty({ formState });

  useEffect(() => {
    if (logRun) {
      formMethods.reset(logRun);
    }
  }, [logRun, formMethods]);

  const closeDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!isDirty || isValid) {
      const values = getValues();
      updateLogRun({ ...logRun, ...values } as TmpLogRun, isDirty);
    }
  };

  if (!logRun) return null;

  return (
    <FormDialog
      open={true}
      title={logRun.id === 0 ? t("newLogRun") : (logRun.runNumber ?? "-")}
      onClose={closeDialog}
      isCloseDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
          <BoreholesCard data-cy="logRun-general" title={t("generalInformation")}>
            <FormContainer>
              <FormContainer direction={"row"}>
                <FormInput fieldName={"runNumber"} required={true} label={"runNumber"} value={logRun.runNumber} />
                <FormInput
                  fieldName={"fromDepth"}
                  required={true}
                  label={"topLoggedInterval"}
                  value={logRun.fromDepth}
                  withThousandSeparator={true}
                />
                <FormInput
                  fieldName={"toDepth"}
                  required={true}
                  label={"bottomLoggedInterval"}
                  value={logRun.toDepth}
                  withThousandSeparator={true}
                />
                <FormDomainSelect
                  fieldName={"boreholeStatusId"}
                  label={"boreholeStatus"}
                  schemaName={"log_borehole_status"}
                  selected={logRun.boreholeStatusId}
                />
              </FormContainer>
              <FormContainer direction={"row"}>
                <FormInput fieldName={"runDate"} label={"runDate"} type={FormValueType.Date} value={logRun.runDate} />
                <FormInput
                  fieldName={"bitSize"}
                  label={"bitSize"}
                  value={logRun.bitSize}
                  withThousandSeparator={true}
                />
                <FormDomainSelect
                  fieldName={"conveyanceMethodId"}
                  label={"conveyanceMethod"}
                  schemaName={"log_convenyance_method"}
                  selected={logRun.conveyanceMethodId}
                />
                <FormInput fieldName={"serviceCo"} label={"serviceCo"} value={logRun.serviceCo} />
              </FormContainer>
              <FormContainer direction={"row"}>
                <FormInput
                  label={t("serviceOrTool")}
                  fieldName="serviceOrTool"
                  readonly={true}
                  inputProps={{
                    startAdornment: (
                      <Stack direction="row" gap={1}>
                        {getServiceOrToolArray(logRun, codelists).map(tool => (
                          <Chip key={tool} label={tool} size="small" color="primary" />
                        ))}
                      </Stack>
                    ),
                    readOnly: true,
                  }}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormInput fieldName="comment" label="comment" multiline={true} rows={3} value={logRun.comment} />
              </FormContainer>
            </FormContainer>
          </BoreholesCard>
          <Stack pb={4.5} />
        </Stack>
      </FormProvider>
    </FormDialog>
  );
};
