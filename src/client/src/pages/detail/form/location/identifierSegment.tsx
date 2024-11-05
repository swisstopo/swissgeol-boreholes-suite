import { useContext } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, Grid, IconButton, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FormDomainSelect, FormInput, FormValueType } from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface IdentifierSegmentProps {
  borehole: BoreholeV2;
  editingEnabled: boolean;
  formMethods: UseFormReturn<LocationFormInputs>;
}

const IdentifierSegment = ({ borehole, editingEnabled, formMethods }: IdentifierSegmentProps) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  const { fields, append, remove } = useFieldArray<LocationFormInputs>({
    name: "boreholeCodelists",
    control: formMethods.control,
  });

  return (
    <Card>
      <FormSegmentBox>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6"> {t("borehole_identifier")}</Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="h6"> {t("borehole_identifier_value")}</Typography>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={6}>
            {t("borehole_technical_id")}
          </Grid>
          <Grid item xs={5}>
            {borehole.id}
          </Grid>
          <Grid item xs={1} />
        </Grid>
        {fields.map((field, index) => (
          <Grid key={field.id} container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sx={{ display: "flex" }}>
              <FormDomainSelect
                fieldName={`boreholeCodelists.${index}.codelistId`}
                label="borehole_identifier"
                selected={field.codelistId}
                readonly={!editingEnabled}
                onUpdate={e => {
                  if (fields.some(field => field.codelistId === e)) {
                    showAlert(t("msgIdentifierAlreadyUsed"), "error");
                    formMethods.resetField(`boreholeCodelists.${index}.codelistId`);
                  }
                }}
                schemaName="borehole_identifier"
              />
            </Grid>
            <Grid item xs={5} sx={{ display: "flex" }}>
              <FormInput
                fieldName={`boreholeCodelists.${index}.value`}
                readonly={!editingEnabled}
                label="borehole_identifier_value"
                value={field.value || ""}
                type={FormValueType.Text}
              />
            </Grid>
            <Grid item xs={1} sx={{ textAlign: "right" }}>
              {editingEnabled && (
                <IconButton sx={{ mt: 2 }} onClick={() => remove(index)} data-cy={`boreholeCodelists.${index}.delete`}>
                  <Trash2 />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}
        <Stack sx={{ mt: 2 }} alignItems="flex-end">
          {editingEnabled && (
            <AddButton
              label="addIdentifier"
              onClick={() => {
                append({ boreholeId: borehole.id, codelistId: null, value: "" });
              }}
            />
          )}
        </Stack>
      </FormSegmentBox>
    </Card>
  );
};

export default IdentifierSegment;
