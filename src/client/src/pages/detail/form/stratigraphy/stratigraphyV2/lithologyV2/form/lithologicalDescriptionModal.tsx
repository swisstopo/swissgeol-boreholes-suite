import { FC, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { LithologicalDescription } from "../../../../../../../api/stratigraphy.ts";
import { BoreholesCard } from "../../../../../../../components/boreholesCard.tsx";
import { FormContainer } from "../../../../../../../components/form/form.ts";
import { useFormDirtyChanges } from "../../../../../../../components/form/useFormDirtyChanges.tsx";
import { BasicDataFormSection } from "./basicDataFormSection.tsx";
import { FormDialog } from "./formDialog.tsx";
import { RemarksFormSection } from "./remarksFormSection.tsx";

interface LithologicalDescriptionModalProps {
  description: LithologicalDescription | undefined;
  fromDepths: number[];
  toDepths: number[];
  updateLithologicalDescription: (description: LithologicalDescription, hasChanges: boolean) => void;
}

export const LithologicalDescriptionModal: FC<LithologicalDescriptionModalProps> = ({
  description,
  fromDepths,
  toDepths,
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

  const closeDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!formState.isDirty || isValid) {
      const values = getValues();
      updateLithologicalDescription({ ...description, ...values } as LithologicalDescription, formState.isDirty);
    }
  };

  return (
    <FormDialog
      open={description !== undefined}
      title={t("lithological_description")}
      onClose={closeDialog}
      isCloseDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
          <BoreholesCard data-cy="lithological-description-basic-data" title={t("basicData")}>
            <FormContainer>
              <BasicDataFormSection fromDepths={fromDepths} toDepths={toDepths} />
              <RemarksFormSection fieldName="description" label="remarks" />
            </FormContainer>
          </BoreholesCard>
        </Stack>
      </FormProvider>
    </FormDialog>
  );
};
