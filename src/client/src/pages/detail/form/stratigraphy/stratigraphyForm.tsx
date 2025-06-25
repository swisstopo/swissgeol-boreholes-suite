import { FC, useContext, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box, FormControlLabel, Stack, Switch } from "@mui/material";
import { Trash2 } from "lucide-react";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { Stratigraphy, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { CancelButton, CopyButton, DeleteButton, SaveButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard.tsx";
import { FormContainer, FormDomainSelect, FormInput, FormValueType } from "../../../../components/form/form.ts";
import { ensureDatetime } from "../../../../components/form/formUtils.ts";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { EditStateContext } from "../../editStateContext.tsx";

interface StratigraphyFormProps {
  stratigraphy: Stratigraphy;
}

export const StratigraphyForm: FC<StratigraphyFormProps> = ({ stratigraphy }) => {
  const { t } = useTranslation();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled } = useContext(EditStateContext);
  const {
    copy: { mutate: copyStratigraphy },
    update: { mutate: updateStratigraphy },
    delete: { mutate: deleteStratigraphy },
  } = useStratigraphyMutations();

  useEffect(() => {
    formMethods.reset({
      ...stratigraphy,
      date: stratigraphy.date?.toString().slice(0, 10) ?? "",
    });
  }, [formMethods, stratigraphy]);

  const submitForm = (data: Stratigraphy) => {
    data.date = data.date ? ensureDatetime(data.date.toString()) : "";
    updateStratigraphy(data);
  };

  useEffect(() => {
    formMethods.setValue("date", stratigraphy.date?.toString().slice(0, 10) ?? "");
  }, [formMethods, stratigraphy.date]);

  return (
    <FormProvider {...formMethods}>
      <DevTool control={formMethods.control} placement="top-left" />
      <FormContainer>
        <FormContainer direction={"row"}>
          <FormInput
            fieldName={"name"}
            label={"stratigraphy_name"}
            value={stratigraphy.name}
            readonly={!editingEnabled}
            type={FormValueType.Text}
          />
          <FormControlLabel
            control={
              <Controller
                name="isPrimary"
                control={formMethods.control}
                defaultValue={stratigraphy.isPrimary}
                render={({ field }) => (
                  <Switch
                    {...field}
                    data-cy={"isprimary-switch"}
                    checked={field.value}
                    color="secondary"
                    disabled={!editingEnabled || stratigraphy.isPrimary}
                  />
                )}
              />
            }
            label={t("mainStratigraphy")}
          />
        </FormContainer>
        <FormContainer direction={"row"}>
          <FormInput
            fieldName={"date"}
            label="date"
            readonly={!editingEnabled}
            value={stratigraphy.date}
            type={FormValueType.Date}
          />
          <FormDomainSelect
            fieldName={"qualityId"}
            label={"stratigraphy_quality"}
            selected={stratigraphy.qualityId}
            readonly={!editingEnabled}
            schemaName={"description_quality"}
          />
        </FormContainer>
        <Stack direction={"row"} gap={1}>
          <Box sx={{ flexGrow: 1 }} />
          {editingEnabled && (
            <>
              <DataCardButtonContainer>
                <CopyButton onClick={() => copyStratigraphy(stratigraphy)} />
                <DeleteButton
                  onClick={() => {
                    showPrompt("deleteMessage", [
                      {
                        label: "cancel",
                      },
                      {
                        label: "delete",
                        icon: <Trash2 />,
                        variant: "contained",
                        action: () => deleteStratigraphy(stratigraphy),
                      },
                    ]);
                  }}
                />
              </DataCardButtonContainer>
              <DataCardButtonContainer>
                <CancelButton dataCy={"stratigraphy-cancel-button"} onClick={() => formMethods.reset()} />
                <SaveButton
                  dataCy={"stratigraphy-save-button"}
                  disabled={!formMethods.formState.isValid}
                  onClick={() => formMethods.handleSubmit(submitForm)()}
                />
              </DataCardButtonContainer>
            </>
          )}
        </Stack>
      </FormContainer>
    </FormProvider>
  );
};
