import { FC, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dialog, Stack, Typography } from "@mui/material";
import { LithologicalDescription } from "../../../../../../api/stratigraphy.ts";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { BoreholesButton } from "../../../../../../components/buttons/buttons.tsx";
import { FormContainer, FormInput } from "../../../../../../components/form/form.ts";
import { useFormDirtyChanges } from "../../../../../../components/form/useFormDirtyChanges.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../../components/styledComponents.ts";

interface LithologicalDescriptionModalProps {
  description: LithologicalDescription | undefined;
  updateLithologicalDescription: (description: LithologicalDescription) => void;
}

export const LithologicalDescriptionModal: FC<LithologicalDescriptionModalProps> = ({
  description,
  updateLithologicalDescription,
}) => {
  const { t } = useTranslation();
  const formMethods = useForm<LithologicalDescription>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyChanges({ formState });

  useEffect(() => {
    if (description) {
      formMethods.reset(description);
    }
  }, [description, formMethods]);

  const closeDialog = () => {
    const values = getValues();
    updateLithologicalDescription({ ...description, ...values } as LithologicalDescription);
  };

  return (
    <Dialog open={description !== undefined} fullScreen>
      <DialogHeaderContainer>
        <Stack direction="row">
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t("lithological_description")}
          </Typography>
        </Stack>
      </DialogHeaderContainer>
      <DialogMainContent sx={{ padding: "0 60px", display: "flex", justifyContent: "center" }}>
        <FormProvider {...formMethods}>
          <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
            <BoreholesCard data-cy="lithological-description-basic-data" title={t("basicData")}>
              <FormContainer>
                <FormContainer direction={"row"}>
                  <FormInput fieldName={"fromDepth"} label={"fromdepth"} required={true} />
                  <FormInput fieldName={"toDepth"} label={"todepth"} required={true} />
                </FormContainer>
                <FormContainer direction={"row"}>
                  <FormInput fieldName={"description"} label={"remarks"} multiline={true} rows={3} />
                </FormContainer>
              </FormContainer>
            </BoreholesCard>
          </Stack>
        </FormProvider>
      </DialogMainContent>
      <DialogFooterContainer>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
          <BoreholesButton variant="contained" color="primary" label={t("close")} onClick={closeDialog} />
        </Stack>
      </DialogFooterContainer>
    </Dialog>
  );
};
