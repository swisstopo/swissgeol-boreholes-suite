import { useContext } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box, Card, IconButton, Stack } from "@mui/material";
import { Trash2 } from "lucide-react";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import {
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormInputDisplayOnly,
  FormValueType,
} from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { EditStateContext } from "../../editStateContext.tsx";
import { IdentifiersFormInputs } from "./identifiersPanelInterfaces.ts";

interface IdentifierSegmentProps {
  borehole: BoreholeV2;
  formMethods: UseFormReturn<IdentifiersFormInputs>;
}

const IdentifierSegment = ({ borehole, formMethods }: IdentifierSegmentProps) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);

  const { fields, append, remove } = useFieldArray<IdentifiersFormInputs, "boreholeCodelists">({
    name: "boreholeCodelists",
    control: formMethods.control,
  });

  return (
    <Card>
      <FormSegmentBox>
        <Stack direction={"row"} gap={2} justifyContent={"space-between"}>
          <FormContainer direction={"column"} gap={2}>
            <FormContainer direction={"row"} gap={2}>
              <FormInputDisplayOnly label={"borehole_identifier"} value={t("borehole_technical_id")} />
              <FormInputDisplayOnly label={"borehole_identifier_value"} value={borehole.id} />
            </FormContainer>
            {fields.map((field, index) => (
              <FormContainer direction={"row"} gap={2} key={field.id}>
                <FormDomainSelect
                  fieldName={`boreholeCodelists.${index}.codelistId`}
                  label="borehole_identifier"
                  selected={field.codelistId}
                  schemaName="borehole_identifier"
                />
                <FormInput
                  fieldName={`boreholeCodelists.${index}.value`}
                  label="borehole_identifier_value"
                  value={field.value}
                  type={FormValueType.Text}
                />
                <FormInput
                  fieldName={`boreholeCodelists.${index}.comment`}
                  label="comment"
                  value={field.comment ?? ""}
                  type={FormValueType.Text}
                />
                {editingEnabled && (
                  <Box sx={{ visibility: editingEnabled ? "visible" : "hidden", mr: "-52px" }} alignItems="flex-end">
                    <IconButton
                      sx={{ mt: 2 }}
                      onClick={() => remove(index)}
                      data-cy={`boreholeCodelists.${index}.delete`}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                )}
              </FormContainer>
            ))}
          </FormContainer>
          {editingEnabled && (
            <Stack sx={{ visibility: editingEnabled ? "visible" : "hidden", ml: 1, mt: 2 }} alignItems="flex-end">
              <AddButton
                label="addIdentifier"
                onClick={() => {
                  append({ boreholeId: borehole.id, codelistId: null, value: "", comment: null });
                }}
              />
            </Stack>
          )}
        </Stack>
      </FormSegmentBox>
    </Card>
  );
};

export default IdentifierSegment;
