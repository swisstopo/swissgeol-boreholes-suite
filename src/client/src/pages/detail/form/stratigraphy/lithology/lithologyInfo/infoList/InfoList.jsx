import { useContext, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box, FormControlLabel, Stack, Switch } from "@mui/material";
import { Trash2 } from "lucide-react";
import { DevTool } from "../../../../../../../../hookformDevtools";
import { copyStratigraphy, deleteStratigraphy } from "../../../../../../../api/fetchApiV2";
import { CancelButton, CopyButton, DeleteButton, SaveButton } from "../../../../../../../components/buttons/buttons";
import { DataCardButtonContainer } from "../../../../../../../components/dataCard/dataCard";
import { FormContainer, FormDomainSelect, FormInput, FormValueType } from "../../../../../../../components/form/form";
import { ensureDatetime } from "../../../../../../../components/form/formUtils";
import { PromptContext } from "../../../../../../../components/prompt/promptContext";
import { EditStateContext } from "../../../../../editStateContext.tsx";
import { updateStratigraphyAttributes } from "../api/index.ts";

const InfoList = ({ id, profileInfo, onUpdated }) => {
  const { t } = useTranslation();
  const formMethods = useForm({ mode: "all" });
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled } = useContext(EditStateContext);

  useEffect(() => {
    formMethods.reset({
      name: profileInfo.name,
      date: profileInfo.date?.toString().slice(0, 10) ?? null,
      qualityId: profileInfo.qualityId,
      isPrimary: profileInfo.isPrimary,
    });
  }, [profileInfo, formMethods]);

  const submitForm = data => {
    data.date = data?.date ? ensureDatetime(data.date.toString()) : null;
    updateStratigraphyAttributes(id, data);
  };

  useEffect(() => {
    formMethods.setValue("date", profileInfo?.date?.toString().slice(0, 10) ?? "");
  }, [profileInfo?.date, formMethods]);

  return (
    <FormProvider {...formMethods}>
      <DevTool control={formMethods.control} placement="top-left" />
      <FormContainer>
        <FormContainer direction={"row"}>
          <FormInput
            fieldName={"name"}
            label={"stratigraphy_name"}
            value={profileInfo.name}
            readonly={!editingEnabled}
            type={FormValueType.Text}></FormInput>
          <FormControlLabel
            control={
              <Controller
                name="isPrimary"
                control={formMethods.control}
                defaultValue={profileInfo?.isPrimary}
                render={({ field }) => (
                  <Switch
                    {...field}
                    data-cy={"isprimary-switch"}
                    checked={field.value}
                    color="secondary"
                    disabled={!editingEnabled || profileInfo?.isPrimary}
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
            value={profileInfo.date}
            type={FormValueType.Date}
          />
          <FormDomainSelect
            fieldName={"qualityId"}
            label={"stratigraphy_quality"}
            selected={profileInfo.qualityId}
            readonly={!editingEnabled}
            schemaName={"description_quality"}
          />
        </FormContainer>
        <Stack direction={"row"} gap={1}>
          <Box sx={{ flexGrow: 1 }} />
          {editingEnabled && (
            <>
              <DataCardButtonContainer>
                <CopyButton
                  onClick={() => {
                    copyStratigraphy(profileInfo?.id).then(() => {
                      onUpdated("cloneStratigraphy");
                    });
                  }}></CopyButton>
                <DeleteButton
                  onClick={() => {
                    showPrompt("deleteMessage", [
                      {
                        label: "cancel",
                        action: null,
                      },
                      {
                        label: "delete",
                        icon: <Trash2 />,
                        variant: "contained",
                        action: () => {
                          deleteStratigraphy(profileInfo?.id).then(() => {
                            onUpdated("deleteStratigraphy");
                          });
                        },
                      },
                    ]);
                  }}
                />
              </DataCardButtonContainer>
              <DataCardButtonContainer>
                <CancelButton
                  dataCy={"stratigraphy-cancel-button"}
                  onClick={() => {
                    formMethods.reset();
                  }}
                />
                <SaveButton
                  dataCy={"" + "stratigraphy-save-button"}
                  disabled={!formMethods.formState.isValid}
                  onClick={() => {
                    formMethods.handleSubmit(submitForm)();
                  }}
                />
              </DataCardButtonContainer>
            </>
          )}
        </Stack>
      </FormContainer>
    </FormProvider>
  );
};

export default InfoList;
