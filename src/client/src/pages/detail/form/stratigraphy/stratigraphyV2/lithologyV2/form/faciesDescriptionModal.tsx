import { FC, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { BoreholesCard } from "../../../../../../../components/boreholesCard.tsx";
import { FormContainer } from "../../../../../../../components/form/formContainer.tsx";
import { FormDialog } from "../../../../../../../components/form/formDialog.tsx";
import { FormDomainSelect } from "../../../../../../../components/form/formDomainSelect.tsx";
import { useFormDirty } from "../../../../../../../components/form/useFormDirty.tsx";
import { FaciesDescription } from "../../../faciesDescription.ts";
import { BasicDataFormSection } from "./basicDataFormSection.tsx";
import { RemarksFormSection } from "./remarksFormSection.tsx";

interface FaciesDescriptionModalProps {
  description: FaciesDescription | undefined;
  fromDepths: number[];
  toDepths: number[];
  updateFaciesDescription: (description: FaciesDescription, hasChanges: boolean) => void;
}

export const FaciesDescriptionModal: FC<FaciesDescriptionModalProps> = ({
  description,
  fromDepths,
  toDepths,
  updateFaciesDescription,
}) => {
  const { t } = useTranslation();
  const formMethods = useForm<FaciesDescription>({ mode: "all" });
  const { formState, getValues } = formMethods;
  const isDirty = useFormDirty({ formState });

  useEffect(() => {
    if (description) {
      formMethods.reset(description);
      formMethods.setValue("faciesId", description?.faciesId ?? null);
    }
  }, [description, formMethods]);

  const closeDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!isDirty || isValid) {
      const values = getValues();
      delete values.facies;
      if (String(values.faciesId) === "") values.faciesId = null;

      updateFaciesDescription(
        { ...description, ...values } as FaciesDescription,
        isDirty || (Boolean(description?.isGap) && isValid),
      );
    }
  };

  return (
    <FormDialog
      open={description !== undefined}
      title={t("facies_description")}
      onClose={closeDialog}
      isCloseDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <Stack gap={3} flex={"0 1 1040px"} m={7.5}>
          <BoreholesCard data-cy="facies-description-basic-data" title={t("basicData")}>
            <FormContainer>
              <BasicDataFormSection fromDepths={fromDepths} toDepths={toDepths} />
              <FormContainer direction={"row"}>
                <FormDomainSelect fieldName={"faciesId"} label={"facies"} schemaName={"facies_con"} />
              </FormContainer>
              <RemarksFormSection fieldName="description" label="remarks" />
            </FormContainer>
          </BoreholesCard>
        </Stack>
      </FormProvider>
    </FormDialog>
  );
};
