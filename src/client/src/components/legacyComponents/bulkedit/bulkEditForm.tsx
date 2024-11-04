import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDownIcon, RotateCcw } from "lucide-react";
import { patchBoreholes } from "../../../api-lib";
import { ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import WorkgroupSelect from "../../../pages/overview/sidePanelContent/commons/workgroupSelect.tsx";
import { AlertContext } from "../../alert/alertContext.tsx";
import { CancelButton, SaveButton } from "../../buttons/buttons";
import { FormValueType } from "../../form/form.ts";
import { FormBooleanSelect } from "../../form/formBooleanSelect.tsx";
import { FormDomainSelect } from "../../form/formDomainSelect.tsx";
import { FormInput } from "../../form/formInput.tsx";
import { StackFullWidth } from "../../styledComponents.ts";
import { BulkEditFormField, BulkEditFormProps, BulkEditFormValue } from "./BulkEditFormProps.ts";

export const BulkEditForm = ({ selected, loadBoreholes }: BulkEditFormProps) => {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Array<[string, BulkEditFormValue]>>([]);
  const [workgroupId, setWorkgroupId] = useState<string>("");
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  const formMethods = useForm({
    mode: "all",
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

  useEffect(() => {
    if (workgroupId) {
      onFieldValueChange(bulkEditFormFields.find(f => f.type === FormValueType.Workgroup)!, parseInt(workgroupId));
    }
  }, [bulkEditFormFields, onFieldValueChange, workgroupId]);

  const undoChange = (field: BulkEditFormField) => {
    const fieldName = field.api ?? field.fieldName;
    const entryIndex = fieldsToUpdate.findIndex(([key]) => key === fieldName);
    if (entryIndex !== -1) {
      setFieldsToUpdate([...fieldsToUpdate.filter(f => f[0] !== fieldName)]);
      if (fieldName === "workgroup") {
        setWorkgroupId("");
      } else {
        formMethods.resetField(fieldName);
      }
    }
  };

  const save = async () => {
    try {
      await patchBoreholes(selected, fieldsToUpdate);
      unselectBoreholes();
      loadBoreholes();
    } catch (error) {
      //@ts-expect-error unknown error type
      showAlert(`${t("errorBulkEditing")} ${error?.message ?? error}`, "error");
    }
  };

  const renderInput = useCallback(
    (field: BulkEditFormField) => {
      if (field.type === FormValueType.Domain) {
        return (
          <FormDomainSelect
            canReset={false}
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
          <WorkgroupSelect
            workgroupId={workgroupId}
            enabledWorkgroups={enabledWorkgroups}
            setWorkgroupId={setWorkgroupId}
            hideLabel={true}
          />
        );
      }
      return (
        <FormInput
          fieldName={field.api ?? field.fieldName}
          label=""
          type={field.type}
          onUpdate={e => {
            onFieldValueChange(field, e);
          }}
        />
      );
    },
    [onFieldValueChange, workgroupId, enabledWorkgroups],
  );

  return (
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
            {bulkEditFormFields.map(field => {
              if (field.type != FormValueType.Workgroup || enabledWorkgroups.length > 1) {
                return (
                  <Accordion key={field.fieldName} data-cy={"bulk-edit-accordion"} sx={{ minHeight: theme.spacing(6) }}>
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
          <CancelButton onClick={unselectBoreholes} />
          <SaveButton variant="contained" disabled={fieldsToUpdate.length === 0} onClick={save} />
        </Stack>
      </DialogActions>
    </Stack>
  );
};
