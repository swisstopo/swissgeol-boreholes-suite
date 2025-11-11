import { FC, useCallback, useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { BoreholesCard } from "../../../../components/boreholesCard";
import { AddButton, StandaloneIconButton } from "../../../../components/buttons/buttons";
import { CodelistLabelStyle, useCodelists } from "../../../../components/codelist";
import {
  FormCheckbox,
  FormContainer,
  FormDialog,
  FormDomainMultiSelect,
  FormDomainSelect,
  FormErrors,
  FormInput,
  FormValueType,
  getFormFieldError,
} from "../../../../components/form/form";
import { validateDepths } from "../../../../components/form/formUtils";
import { useFormDirty } from "../../../../components/form/useFormDirty";
import { EditStateContext } from "../../editStateContext";
import { FileDropzone } from "./fileDropzone.tsx";
import { LogFile, LogRun } from "./log";
import { LogFileTable } from "./logFilesTable";
import { getFileExtension, getServiceOrToolArray, validateFiles, validateRunNumber } from "./logUtils";

type LogFileField = LogFile & { fileKey: string };

interface LogRunModalProps {
  logRun: LogRun | undefined;
  updateLogRun: (logRun: LogRun, hasChanges: boolean) => void;
  runs: LogRun[];
}

export const LogRunModal: FC<LogRunModalProps> = ({ logRun, updateLogRun, runs }) => {
  const { t } = useTranslation();
  const { data: codelists } = useCodelists();
  const { editingEnabled } = useContext(EditStateContext);

  const formMethods = useForm<LogRun>({
    mode: "all",
    resolver: async values => {
      const errors: FormErrors = {};
      validateDepths(values, errors);
      validateRunNumber(values, errors, runs);
      validateFiles(values, errors);
      return { values, errors };
    },
  });

  const {
    fields: fileFields,
    prepend,
    remove,
  } = useFieldArray({
    control: formMethods.control,
    name: "logFiles",
    keyName: "fileKey",
  });
  const files: LogFileField[] = fileFields as unknown as LogFileField[];

  const { formState, getValues } = formMethods;
  const isDirty = useFormDirty({ formState });

  const watchedFiles = useWatch({ control: formMethods.control, name: "logFiles" }) as LogFile[] | undefined;

  useEffect(() => {
    if (logRun) {
      const withTmpFileIds = {
        ...logRun,
        logFiles: logRun.logFiles?.map(f => ({
          ...f,
          extension: getFileExtension(f.name),
          tmpId: f.tmpId ?? (f.id > 0 ? String(f.id) : uuidv4()),
        })) as LogFile[],
      } as LogRun;
      formMethods.reset(withTmpFileIds);
    }
  }, [logRun, formMethods]);

  const addFile = useCallback(() => {
    const newFile: LogFile = {
      id: 0,
      logRunId: logRun?.id ?? 0,
      name: "",
      extension: "",
      passTypeId: null,
      pass: null,
      dataPackageId: null,
      deliveryDate: null,
      depthTypeId: null,
      toolTypeCodelistIds: [],
      public: false,
      tmpId: uuidv4(),
    };
    prepend(newFile);
  }, [prepend, logRun]);

  const removeFile = useCallback(
    (idx: number) => () => {
      remove(idx);
    },
    [remove],
  );

  const onFileChanged = useCallback(
    (selected: File | undefined, index: number) => {
      const currentName = formMethods.getValues(`logFiles.${index}.name`);
      const updatedName = selected ? selected.name : "";
      if (currentName !== updatedName) {
        formMethods.setValue(`logFiles.${index}.name`, updatedName, { shouldDirty: true, shouldTouch: true });
        formMethods.setValue(`logFiles.${index}.extension`, getFileExtension(updatedName), {
          shouldDirty: true,
          shouldTouch: true,
        });
        formMethods.trigger(`logFiles.${index}`);
        formMethods.setValue(`logFiles.${index}.file`, selected, { shouldDirty: true, shouldTouch: true });
      }
    },
    [formMethods],
  );

  const closeDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!isDirty || isValid) {
      const values = getValues();
      updateLogRun({ ...logRun, ...values } as LogRun, isDirty);
    }
  };

  if (!logRun) return null;

  const filesSection =
    files.length === 0 ? (
      <Typography pl={2}>{t("noLogFile")}</Typography>
    ) : (
      <Stack gap={2.25}>
        {files.map((file, index) => {
          const name = watchedFiles?.[index]?.name ?? file.name;
          const titleText = name || (file.id === 0 ? t("newFile") : "-");
          const logFileErrors = formState.errors.logFiles?.[index];
          const nameError = getFormFieldError("name", logFileErrors);
          return (
            <BoreholesCard
              key={file.fileKey}
              data-cy={`logRun-file-${index}`}
              title={titleText}
              action={
                <StandaloneIconButton
                  icon={<Trash2 />}
                  color="primaryInverse"
                  onClick={removeFile(index)}
                  dataCy={"delete-file-button"}
                />
              }>
              <FormContainer>
                <FileDropzone
                  existingFile={file.name ? new File([], file.name) : undefined}
                  onChange={file => onFileChanged(file, index)}
                  errorMessageKey={nameError?.message}
                />
                <FormContainer direction={"row"}>
                  <FormDomainMultiSelect
                    schemaName="log_tool_type"
                    fieldName={`logFiles.${index}.toolTypeCodelistIds`}
                    label="toolType"
                    labelStyle={CodelistLabelStyle.TextAndCodeChipsCodeOnly}
                  />
                  <FormInput fieldName={`logFiles.${index}.extension`} label="extension" readonly />
                  <FormDomainSelect
                    schemaName="log_pass_type"
                    fieldName={`logFiles.${index}.passTypeId`}
                    label="passType"
                  />
                  <FormInput fieldName={`logFiles.${index}.pass`} label="pass" type={FormValueType.Number} />
                </FormContainer>
                <FormContainer direction={"row"}>
                  <FormDomainSelect
                    schemaName="log_data_package"
                    fieldName={`logFiles.${index}.dataPackageId`}
                    label="dataPackage"
                  />
                  <FormInput
                    fieldName={`logFiles.${index}.deliveryDate`}
                    label="deliveryDate"
                    type={FormValueType.Date}
                  />
                  <FormDomainSelect
                    schemaName="log_depth_type"
                    fieldName={`logFiles.${index}.depthTypeId`}
                    label="depthType"
                  />
                  <FormCheckbox fieldName={`logFiles.${index}.public`} label="public" sx={{ flex: 1 }} />
                </FormContainer>
              </FormContainer>
            </BoreholesCard>
          );
        })}
      </Stack>
    );

  return (
    <FormDialog
      open={true}
      title={logRun.id === 0 ? t("newLogRun") : (logRun.runNumber ?? "-")}
      onClose={closeDialog}
      isCloseDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <Stack gap={3} m={7.5} width="100%">
          <BoreholesCard data-cy="logRun-general" title={t("generalInformation")}>
            <FormContainer>
              <FormContainer direction="row">
                <FormInput fieldName="runNumber" required label="runNumber" value={logRun.runNumber} />
                <FormInput
                  fieldName="fromDepth"
                  required
                  label="topLoggedInterval"
                  value={logRun.fromDepth}
                  withThousandSeparator
                />
                <FormInput
                  fieldName="toDepth"
                  required
                  label="bottomLoggedInterval"
                  value={logRun.toDepth}
                  withThousandSeparator
                />
                <FormDomainSelect
                  fieldName="boreholeStatusId"
                  label="boreholeStatus"
                  schemaName="log_borehole_status"
                  selected={logRun.boreholeStatusId}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormInput fieldName="runDate" label="runDate" type={FormValueType.Date} value={logRun.runDate} />
                <FormInput fieldName="bitSize" label="bitSize" value={logRun.bitSize} withThousandSeparator />
                <FormDomainSelect
                  fieldName="conveyanceMethodId"
                  label="conveyanceMethod"
                  schemaName="log_conveyance_method"
                  selected={logRun.conveyanceMethodId}
                />
                <FormInput fieldName="serviceCo" label="serviceCo" value={logRun.serviceCo} />
              </FormContainer>
              <FormContainer direction="row">
                <FormInput
                  label={t("serviceOrTool")}
                  fieldName="serviceOrTool"
                  readonly
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
                <FormInput fieldName="comment" label="comment" multiline rows={3} value={logRun.comment} />
              </FormContainer>
            </FormContainer>
          </BoreholesCard>
          <BoreholesCard
            data-cy="logRun-files"
            title={t("files")}
            action={editingEnabled && <AddButton label="addFile" variant="contained" onClick={addFile} />}>
            {editingEnabled ? filesSection : <LogFileTable files={logRun.logFiles ?? []} />}
          </BoreholesCard>
          <Stack pb={4.5} />
        </Stack>
      </FormProvider>
    </FormDialog>
  );
};
