import { FC, useCallback, useContext, useEffect, useRef } from "react";
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
import { LogFileTable } from "./logFilesTable";
import { LogFile, LogRun } from "./logInterfaces";
import {
  getFileExtension,
  getServiceOrToolArray,
  toStoredFileName,
  validateFiles,
  validateRunNumber,
} from "./logUtils";

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
      if (Object.keys(errors).length > 0) {
        return { values: {}, errors };
      }
      return { values, errors: {} };
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

  /** What the run held under a name that was taken out while this dialog has been open. */
  const replacedFileIds = useRef(new Map<string, number>());

  useEffect(() => {
    replacedFileIds.current.clear();
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
    return () => {
      formMethods.reset({
        logFiles: [],
      });
    };
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
      // Putting the same name back has to replace what the run holds rather than add a second
      // file under it, so the identity of what was taken out is kept for as long as the dialog
      // is open. Matching on the name alone could not tell a replacement from a file the server
      // happens to hold already.
      const removed = formMethods.getValues(`logFiles.${idx}`);
      if (removed !== undefined && removed.id > 0 && removed.name !== undefined) {
        replacedFileIds.current.set(removed.name, removed.id);
      }
      remove(idx);
    },
    [formMethods, remove],
  );

  const onFileChanged = useCallback(
    (selected: File | undefined, index: number): string | void => {
      const updatedName = selected ? toStoredFileName(selected.name) : "";
      const existingFiles = formMethods.getValues("logFiles") ?? [];
      if (
        updatedName &&
        existingFiles.some((f, i) => i !== index && f.name?.toLowerCase() === updatedName.toLowerCase())
      ) {
        const errorMessage = t("duplicateFileName", { fileName: updatedName });
        formMethods.setError(`logFiles.${index}.name`, { type: "manual", message: errorMessage });
        return errorMessage;
      }
      formMethods.clearErrors(`logFiles.${index}.name`);
      const currentName = formMethods.getValues(`logFiles.${index}.name`);
      if (currentName !== updatedName) {
        formMethods.setValue(`logFiles.${index}.name`, updatedName, { shouldDirty: true, shouldTouch: true });
        formMethods.setValue(`logFiles.${index}.extension`, getFileExtension(updatedName), {
          shouldDirty: true,
          shouldTouch: true,
        });
        formMethods.trigger(`logFiles.${index}`);
        formMethods.setValue(`logFiles.${index}.file`, selected, { shouldDirty: true, shouldTouch: true });

        // Taking a file out and putting the same name back replaces what the run holds. Keeping
        // the identity it had makes the upload overwrite that file instead of adding a second
        // one, which the run would refuse because the name is already taken.
        const replacedId = replacedFileIds.current.get(updatedName);
        if (replacedId !== undefined) {
          formMethods.setValue(`logFiles.${index}.id`, replacedId, { shouldDirty: true });
        }
      }
    },
    [formMethods, t],
  );

  const cancelDialog = () => {
    updateLogRun(logRun as LogRun, false);
  };

  const applyDialog = async () => {
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
                  onChange={files => onFileChanged(files[0], index)}
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
      onClose={cancelDialog}
      onApply={applyDialog}
      isApplyDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <BoreholesCard data-cy="logRun-general" title={t("generalInformation")}>
          <FormContainer>
            <FormContainer direction="row">
              <FormInput fieldName="runNumber" required label="runNumber" value={logRun.runNumber} />
              <FormInput
                fieldName="fromDepth"
                required
                label="topLoggedInterval"
                value={logRun.fromDepth}
                type={FormValueType.Number}
              />
              <FormInput
                fieldName="toDepth"
                required
                label="bottomLoggedInterval"
                value={logRun.toDepth}
                type={FormValueType.Number}
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
              <FormInput fieldName="bitSize" label="bitSize" value={logRun.bitSize} type={FormValueType.Number} />
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
                      {getServiceOrToolArray(watchedFiles, codelists).map(tool => (
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
      </FormProvider>
    </FormDialog>
  );
};
