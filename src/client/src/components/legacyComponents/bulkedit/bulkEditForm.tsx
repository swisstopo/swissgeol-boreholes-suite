import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDownIcon, X } from "lucide-react";
import { patchBoreholes } from "../../../api-lib";
import { CancelButton, SaveButton } from "../../buttons/buttons";
import { useTranslation } from "react-i18next";
import { ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { BulkEditFormField, BulkEditFormProps, BulkEditFormValue } from "./BulkEditFormProps.ts";
import { theme } from "../../../AppTheme.ts";
import { FormInput } from "../../form/formInput.tsx";
import { FormSelect } from "../../form/formSelect.tsx";
import { FormProvider, useForm } from "react-hook-form";
import { FormValueType } from "../../form/form.ts";
import { FormDomainSelect } from "../../form/formDomainSelect.tsx";
import { StackFullWidth } from "../../styledComponents.ts";
import WorkgroupSelect from "../../../pages/overview/sidePanelContent/commons/workgroupSelect.tsx";
import { AlertContext } from "../../alert/alertContext.tsx";

export const BulkEditForm = ({ selected, loadBoreholes }: BulkEditFormProps) => {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Array<[string, BulkEditFormValue]>>([]);
  const [workgroupId, setWorkgroupId] = useState<number | null>(null);
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

  const onFieldValueChange = useCallback(
    (fieldName: string, newValue: BulkEditFormValue) => {
      const entryIndex = fieldsToUpdate.findIndex(([key]) => key === fieldName);

      if (entryIndex === -1) {
        // Add field if it's not yet contained in array
        setFieldsToUpdate([...fieldsToUpdate, [fieldName, newValue]]);
      } else {
        // Update field if it's already contained in array
        const newData = [...fieldsToUpdate];
        newData[entryIndex] = [fieldName, newValue];
        setFieldsToUpdate(newData);
      }
    },
    [fieldsToUpdate],
  );

  useEffect(() => {
    if (workgroupId) {
      onFieldValueChange("workgroup", workgroupId);
    }
  }, [onFieldValueChange, workgroupId]);

  const undoChange = (fieldName: string) => {
    const entryIndex = fieldsToUpdate.findIndex(([key]) => key === fieldName);
    if (entryIndex !== -1) {
      setFieldsToUpdate([...fieldsToUpdate.filter(f => f[0] !== fieldName)]);
      formMethods.resetField(fieldName);
      if (fieldName === "workgroup") {
        setWorkgroupId(null);
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
      showAlert(`${t("errorBulkEditing")} ${error?.message || error}`, "error");
    }
  };

  const bulkEditFormFields: BulkEditFormField[] = [
    { fieldName: "project_name", type: FormValueType.Text, api: "custom.project_name" },
    { fieldName: "restriction", type: FormValueType.Domain, api: "restriction" },
    { fieldName: "workgroup", api: "workgroup" },
    {
      fieldName: "restriction_until",
      type: FormValueType.Date,
      api: "restriction_until",
    },
    { fieldName: "national_interest", type: FormValueType.Boolean, api: "national_interest" },
    { fieldName: "location_precision", type: FormValueType.Domain, api: "location_precision" },
    { fieldName: "elevation_precision", type: FormValueType.Domain, api: "elevation_precision" },
    {
      fieldName: "reference_elevation_qt",
      type: FormValueType.Domain,
      api: "qt_reference_elevation",
      domain: "elevation_precision",
    },
    { fieldName: "reference_elevation_type", type: FormValueType.Domain, api: "reference_elevation_type" },
    { fieldName: "borehole_type", type: FormValueType.Domain, api: "borehole_type" },
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
  ];

  const renderInput = useCallback(
    (field: BulkEditFormField) => {
      if (field.fieldName === "workgroup") return;
      if (field.type === FormValueType.Domain) {
        return (
          <FormDomainSelect
            fieldName={field.fieldName}
            label={field.fieldName}
            canReset={false}
            schemaName={field?.domain || field.api}
            onUpdate={e => {
              onFieldValueChange(field.fieldName, e);
            }}
          />
        );
      }

      if (field.type === FormValueType.Boolean) {
        return (
          <FormSelect
            canReset={false}
            fieldName={field.fieldName}
            label={field.fieldName}
            values={[
              { key: 0, value: true, name: t("yes") },
              { key: 1, value: false, name: t("no") },
              { key: 2, value: undefined, name: t("np") },
            ]}
            onUpdate={e => {
              onFieldValueChange(field.fieldName, e);
            }}
          />
        );
      }
      return (
        <FormInput
          fieldName={field.fieldName}
          label={field.fieldName}
          type={field.type}
          onUpdate={e => {
            onFieldValueChange(field.fieldName, e);
          }}
        />
      );
    },
    [onFieldValueChange, t],
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
        <FormProvider {...formMethods}>
          {bulkEditFormFields.map(field => {
            if (field.fieldName != "workgroup" || enabledWorkgroups.length > 1) {
              return (
                <Accordion key={field.fieldName} data-cy={"bulk-edit-accordion"}>
                  <AccordionSummary expandIcon={<ChevronDownIcon />} sx={{ pl: 1 }}>
                    <Stack direction="row">
                      <IconButton
                        size="small"
                        sx={{
                          visibility: fieldsToUpdate.map(f => f[0]).includes(field.fieldName) ? "visible" : "hidden",
                          mr: 1,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          undoChange(field.fieldName);
                        }}>
                        <X fontSize="small" color={theme.palette.primary.main} />
                      </IconButton>
                      <Typography>{t(field.fieldName)}</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pl: 5, pr: 3 }}>
                    <StackFullWidth>
                      <>
                        {renderInput(field)}
                        {field.fieldName === "workgroup" && (
                          <WorkgroupSelect
                            workgroupId={workgroupId}
                            enabledWorkgroups={enabledWorkgroups}
                            setWorkgroupId={setWorkgroupId}
                          />
                        )}
                      </>
                    </StackFullWidth>
                  </AccordionDetails>
                </Accordion>
              );
            }
          })}
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: 2 }}>
          <CancelButton onClick={unselectBoreholes} />
          <SaveButton variant="contained" disabled={fieldsToUpdate.length === 0} onClick={save} />
        </Stack>
      </DialogActions>
    </Stack>
  );
};
