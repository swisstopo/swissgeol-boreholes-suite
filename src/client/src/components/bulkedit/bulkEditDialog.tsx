import { useCallback, useContext, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDownIcon, RotateCcw } from "lucide-react";
import { DevTool } from "../../../hookformDevtools.ts";
import { buildBulkEditRequest, bulkEditBoreholes } from "../../api/borehole.ts";
import { ApiError } from "../../api/errorClasses.ts";
import { BoreholeBulkUpdate, Workgroup } from "../../api/generated";
import { theme } from "../../AppTheme.ts";
import { useUserWorkgroups } from "../../pages/overview/UserWorkgroupsContext.tsx";
import { AlertContext } from "../alert/alertContext.tsx";
import { CancelButton, SaveButton } from "../buttons/buttons.tsx";
import { FormSelect, FormValueType } from "../form/form.ts";
import { FormBooleanSelect } from "../form/formBooleanSelect.tsx";
import { FormDomainSelect } from "../form/formDomainSelect.tsx";
import { FormInput } from "../form/formInput.tsx";
import { StackFullWidth } from "../styledComponents.ts";
import { BulkEditFormField, BulkEditFormProps, BulkEditFormValue } from "./BulkEditFormProps.ts";

export const BulkEditDialog = ({ isOpen, selected, loadBoreholes }: BulkEditFormProps) => {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Array<[keyof BoreholeBulkUpdate, BulkEditFormValue]>>([]);
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();
  const { editableWorkgroups } = useUserWorkgroups();

  const bulkEditFormFields: BulkEditFormField[] = useMemo(
    () => [
      { fieldName: "projectName", type: FormValueType.Text, payloadKey: "projectName" },
      { fieldName: "restriction", type: FormValueType.Domain, payloadKey: "restrictionId", schemaName: "restriction" },
      { fieldName: "workgroup", type: FormValueType.Workgroup, payloadKey: "workgroupId" },
      { fieldName: "restrictionUntil", type: FormValueType.Date, payloadKey: "restrictionUntil" },
      { fieldName: "nationalInterest", type: FormValueType.Boolean, payloadKey: "nationalInterest" },
      {
        fieldName: "locationPrecision",
        type: FormValueType.Domain,
        payloadKey: "locationPrecisionId",
        schemaName: "location_precision",
      },
      {
        fieldName: "elevationPrecision",
        type: FormValueType.Domain,
        payloadKey: "elevationPrecisionId",
        schemaName: "elevation_precision",
      },
      {
        fieldName: "referenceElevationPrecision",
        type: FormValueType.Domain,
        payloadKey: "referenceElevationPrecisionId",
        schemaName: "elevation_precision",
      },
      {
        fieldName: "referenceElevationType",
        type: FormValueType.Domain,
        payloadKey: "referenceElevationTypeId",
        schemaName: "reference_elevation_type",
      },
      { fieldName: "boreholeType", type: FormValueType.Domain, payloadKey: "typeId", schemaName: "borehole_type" },
      { fieldName: "purpose", type: FormValueType.Domain, payloadKey: "purposeId", schemaName: "drilling_purpose" },
      {
        fieldName: "boreholeStatus",
        type: FormValueType.Domain,
        payloadKey: "statusId",
        schemaName: "borehole_status",
      },
      { fieldName: "totalDepth", type: FormValueType.Number, payloadKey: "totalDepth" },
      {
        fieldName: "depthPrecision",
        type: FormValueType.Domain,
        payloadKey: "depthPrecisionId",
        schemaName: "depth_precision",
      },
      { fieldName: "topBedrockFreshMd", type: FormValueType.Number, payloadKey: "topBedrockFreshMd" },
      { fieldName: "topBedrockWeatheredMd", type: FormValueType.Number, payloadKey: "topBedrockWeatheredMd" },
      { fieldName: "hasGroundwater", type: FormValueType.Boolean, payloadKey: "hasGroundwater" },
      {
        fieldName: "lithologyTopBedrock",
        type: FormValueType.Domain,
        payloadKey: "lithologyTopBedrockId",
        schemaName: "lithology_con",
      },
      {
        fieldName: "lithostratigraphyTopBedrock",
        type: FormValueType.Domain,
        payloadKey: "lithostratigraphyTopBedrockId",
        schemaName: "lithostratigraphy",
      },
      {
        fieldName: "chronostratigraphyTopBedrock",
        type: FormValueType.Domain,
        payloadKey: "chronostratigraphyTopBedrockId",
        schemaName: "chronostratigraphy",
      },
    ],
    [],
  );

  const formMethods = useForm({
    mode: "all",
    defaultValues: bulkEditFormFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.fieldName] = "";
      return acc;
    }, {}),
  });

  const dispatch = useDispatch();
  const unselectBoreholes = () => {
    dispatch({
      type: "EDITOR_MULTIPLE_SELECTED",
      selection: null,
    });
  };

  const onFieldValueChange = useCallback((field: BulkEditFormField, newValue: BulkEditFormValue) => {
    const key = field.payloadKey;
    const updatedValue: BulkEditFormValue =
      field.type === FormValueType.Number ? parseFloat(newValue as string) : newValue;
    setFieldsToUpdate(prev => {
      const entryIndex = prev.findIndex(([k]) => k === key);
      if (entryIndex === -1) {
        return [...prev, [key, updatedValue]];
      }
      const newData = [...prev];
      newData[entryIndex] = [key, updatedValue];
      return newData;
    });
  }, []);

  const undoChange = (field: BulkEditFormField) => {
    const entryIndex = fieldsToUpdate.findIndex(([k]) => k === field.payloadKey);
    if (entryIndex !== -1) {
      setFieldsToUpdate([...fieldsToUpdate.filter(([k]) => k !== field.payloadKey)]);
      formMethods.resetField(field.fieldName);
    }
  };

  const resetFormState = () => {
    setFieldsToUpdate([]);
    formMethods.reset();
  };

  const cancelBulkEdit = () => {
    resetFormState();
    unselectBoreholes();
  };

  const save = async () => {
    try {
      const boreholeIds = selected.filter((id): id is number => typeof id === "number");
      await bulkEditBoreholes(buildBulkEditRequest(boreholeIds, fieldsToUpdate));
      unselectBoreholes();
      loadBoreholes();
    } catch (error) {
      if (error instanceof ApiError && error.messageKey === "bulkEditUnauthorizedBoreholes") {
        const rawIds = error.details?.unauthorizedBoreholeIds;
        const ids = Array.isArray(rawIds) ? rawIds.filter((id): id is number => typeof id === "number") : [];
        showAlert(`${t("bulkEditUnauthorizedBoreholes")} ${ids.join(", ")}`, "error");
      } else {
        const message = error instanceof Error ? error.message : String(error);
        showAlert(`${t("errorBulkEditing")} ${message}`, "error");
      }
    } finally {
      resetFormState();
    }
  };

  const renderInput = useCallback(
    (field: BulkEditFormField) => {
      if (field.type === FormValueType.Domain) {
        return (
          <FormDomainSelect
            canReset={false}
            readonly={false}
            fieldName={field.fieldName}
            label=""
            schemaName={field.schemaName ?? field.fieldName}
            onUpdate={e => {
              onFieldValueChange(field, e);
            }}
          />
        );
      }
      if (field.type === FormValueType.Boolean) {
        return (
          <FormBooleanSelect
            canReset={false}
            readonly={false}
            fieldName={field.fieldName}
            label=""
            onUpdate={e => {
              onFieldValueChange(field, e);
            }}
          />
        );
      }
      if (field.type === FormValueType.Workgroup) {
        return (
          <FormSelect
            canReset={false}
            readonly={false}
            fieldName={"workgroup"}
            label=""
            values={editableWorkgroups.map((wg: Workgroup) => ({
              key: wg.id,
              name: wg.name ?? "",
            }))}
            onUpdate={e => {
              onFieldValueChange(field, e);
            }}
          />
        );
      }
      return (
        <FormInput
          fieldName={field.fieldName}
          label=""
          type={field.type}
          readonly={false}
          onUpdate={e => {
            onFieldValueChange(field, e);
          }}
        />
      );
    },
    [onFieldValueChange, editableWorkgroups],
  );

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={isOpen}
      PaperProps={{
        sx: {
          overflow: "hidden",
          height: "90vh",
        },
      }}>
      <Stack sx={{ height: "100%" }}>
        <DialogTitle>
          <Typography variant="h1">{t("bulkEditing")}</Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            overflowY: "auto",
            flexGrow: 1,
          }}>
          <Box sx={{ mt: 3 }}>
            <FormProvider {...formMethods}>
              <DevTool control={formMethods.control} placement="top-left" />
              {bulkEditFormFields.map(field => {
                if (field.type != FormValueType.Workgroup || editableWorkgroups.length > 1) {
                  return (
                    <Accordion
                      key={field.fieldName}
                      data-cy={"bulk-edit-accordion"}
                      sx={{ minHeight: theme.spacing(6) }}>
                      <AccordionSummary
                        expandIcon={<ChevronDownIcon />}
                        sx={{
                          pl: 1,
                          "& .MuiAccordionSummary-content": {
                            m: 0,
                          },
                        }}>
                        <Stack direction="row" alignItems="center">
                          <IconButton
                            size="small"
                            data-cy="bulk-edit-reset-button"
                            sx={{
                              visibility: fieldsToUpdate.map(([k]) => k).includes(field.payloadKey)
                                ? "visible"
                                : "hidden",
                              mr: 1,
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              undoChange(field);
                            }}>
                            <RotateCcw fontSize="small" color={theme.palette.primary.main} />
                          </IconButton>
                          <Typography variant="h6" sx={{ color: "black" }}>
                            {t(field.fieldName)}
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pl: 5, pr: 3, mt: -4 }}>
                        <StackFullWidth>
                          <>{renderInput(field)}</>
                        </StackFullWidth>
                      </AccordionDetails>
                    </Accordion>
                  );
                }
              })}
            </FormProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={cancelBulkEdit} />
            <SaveButton variant="contained" disabled={fieldsToUpdate.length === 0} onClick={save} />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
