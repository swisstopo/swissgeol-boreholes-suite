import { useCallback, useContext, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
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
import { patchBoreholes } from "../../api-lib";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { AlertContext } from "../alert/alertContext.tsx";
import { CancelButton, SaveButton } from "../buttons/buttons.tsx";
import { FormSelect, FormValueType } from "../form/form.ts";
import { FormBooleanSelect } from "../form/formBooleanSelect.tsx";
import { FormDomainSelect } from "../form/formDomainSelect.tsx";
import { FormInput } from "../form/formInput.tsx";
import { StackFullWidth } from "../styledComponents.ts";
import { BulkEditFormField, BulkEditFormProps, BulkEditFormValue } from "./BulkEditFormProps.ts";

export const BulkEditDialog = ({ isOpen, selected, loadBoreholes }: BulkEditFormProps) => {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Array<[string, BulkEditFormValue]>>([]);
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  // This data structure is needed because of discrepancies between translation keys (fieldName), field names in legacy Api (api) and codelist names (domain).
  const bulkEditFormFields: BulkEditFormField[] = useMemo(
    () => [
      { fieldName: "project_name", type: FormValueType.Text, api: "custom.project_name" },
      { fieldName: "restriction", type: FormValueType.Domain },
      { fieldName: "workgroup", type: FormValueType.Workgroup },
      {
        fieldName: "restriction_until",
        type: FormValueType.Date,
      },
      { fieldName: "national_interest", type: FormValueType.Boolean },
      { fieldName: "location_precision", type: FormValueType.Domain },
      { fieldName: "elevation_precision", type: FormValueType.Domain },
      {
        fieldName: "reference_elevation_qt",
        type: FormValueType.Domain,
        api: "qt_reference_elevation",
        domain: "elevation_precision",
      },
      { fieldName: "reference_elevation_type", type: FormValueType.Domain },
      { fieldName: "borehole_type", type: FormValueType.Domain },
      { fieldName: "purpose", type: FormValueType.Domain, api: "extended.purpose" },
      { fieldName: "boreholestatus", type: FormValueType.Domain, api: "extended.status" },
      { fieldName: "totaldepth", type: FormValueType.Number, api: "total_depth" },
      { fieldName: "qt_depth", type: FormValueType.Domain, api: "depth_precision" },
      { fieldName: "top_bedrock_fresh_md", type: FormValueType.Number, api: "extended.top_bedrock_fresh_md" },
      {
        fieldName: "top_bedrock_weathered_md",
        type: FormValueType.Number,
        api: "custom.top_bedrock_weathered_md",
      },
      { fieldName: "groundwater", type: FormValueType.Boolean, api: "extended.groundwater" },
      { fieldName: "lithology_top_bedrock", type: FormValueType.Domain, api: "custom.lithology_top_bedrock" }, /// ?
      {
        fieldName: "lithostratigraphy_top_bedrock",
        type: FormValueType.Domain,
        api: "custom.lithostratigraphy_top_bedrock",
      },
      {
        fieldName: "chronostratigraphy_top_bedrock",
        type: FormValueType.Domain,
        api: "custom.chronostratigraphy_top_bedrock",
      },
    ],
    [],
  );

  const formMethods = useForm({
    mode: "all",
    defaultValues: bulkEditFormFields.reduce<Record<string, string>>((acc, field) => {
      const key = field.api ?? field.fieldName;
      acc[key] = "";
      return acc;
    }, {}),
  });

  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const enabledWorkgroups = user.data.workgroups.filter(w => w.disabled === null && w.roles.includes("EDIT"));

  const dispatch = useDispatch();
  const unselectBoreholes = () => {
    dispatch({
      type: "EDITOR_MULTIPLE_SELECTED",
      selection: null,
    });
  };

  const onFieldValueChange = useCallback(
    (field: BulkEditFormField, newValue: BulkEditFormValue) => {
      const fieldName = field.api ?? field.fieldName;
      let updatedValue: BulkEditFormValue = newValue;
      if (field.type === FormValueType.Number) {
        updatedValue = parseFloat(newValue as string);
      }
      const entryIndex = fieldsToUpdate.findIndex(([key]) => key === fieldName);
      if (entryIndex === -1) {
        // Add field if it's not yet contained in array
        setFieldsToUpdate([...fieldsToUpdate, [fieldName, updatedValue]]);
      } else {
        // Update field if it's already contained in array
        const newData = [...fieldsToUpdate];
        newData[entryIndex] = [fieldName, updatedValue];
        setFieldsToUpdate(newData);
      }
    },
    [fieldsToUpdate],
  );

  const undoChange = (field: BulkEditFormField) => {
    const fieldName = field.api ?? field.fieldName;
    const entryIndex = fieldsToUpdate.findIndex(([key]) => key === fieldName);
    if (entryIndex !== -1) {
      setFieldsToUpdate([...fieldsToUpdate.filter(f => f[0] !== fieldName)]);
      formMethods.resetField(fieldName);
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
      await patchBoreholes(selected, fieldsToUpdate);
      unselectBoreholes();
      loadBoreholes();
    } catch (error) {
      //@ts-expect-error unknown error type
      showAlert(`${t("errorBulkEditing")} ${error?.message ?? error}`, "error");
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
            fieldName={field.api ?? field.fieldName}
            label=""
            schemaName={field?.domain ?? field.api ?? field.fieldName}
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
            fieldName={field.api ?? field.fieldName}
            label=""
            onUpdate={e => {
              onFieldValueChange(field, e);
            }}
          />
        );
      }
      if (field.fieldName === FormValueType.Workgroup) {
        return (
          <FormSelect
            canReset={false}
            fieldName={"workgroup"}
            label=""
            values={enabledWorkgroups
              .filter(w => w.roles.includes("EDIT"))
              .map(wg => ({
                key: wg.id,
                name: wg.workgroup,
              }))}
            onUpdate={e => {
              onFieldValueChange(field, e);
            }}
          />
        );
      }
      return (
        <FormInput
          fieldName={field.api ?? field.fieldName}
          label=""
          type={field.type}
          readonly={false}
          onUpdate={e => {
            onFieldValueChange(field, e);
          }}
        />
      );
    },
    [onFieldValueChange, enabledWorkgroups],
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
                if (field.type != FormValueType.Workgroup || enabledWorkgroups.length > 1) {
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
                              visibility: fieldsToUpdate.map(f => f[0]).includes(field.api ?? field.fieldName)
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
