import { FC, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BoreholesCard } from "../../../../../../components/boreholesCard.tsx";
import { FormContainer, FormInput, FormValueType } from "../../../../../../components/form/form.ts";
import { FormDialog } from "../../../../../../components/form/formDialog.tsx";
import { useFormDirty } from "../../../../../../components/form/useFormDirty.tsx";
import { LithologicalDescription } from "../../lithologicalDescription.ts";
import { RemarksFormSection } from "./remarksFormSection.tsx";

interface LithologicalDescriptionModalProps {
  description: LithologicalDescription | undefined;
  updateLithologicalDescription: (description: LithologicalDescription, hasChanges: boolean) => void;
}

export const LithologicalDescriptionModal: FC<LithologicalDescriptionModalProps> = ({
  description,
  updateLithologicalDescription,
}) => {
  const { t } = useTranslation();
  const formMethods = useForm<LithologicalDescription>({ mode: "all" });
  const { formState, getValues } = formMethods;
  const isDirty = useFormDirty({ formState });

  useEffect(() => {
    if (description) {
      formMethods.reset(description);
    }
  }, [description, formMethods]);

  const cancelDialog = () => {
    updateLithologicalDescription(description as LithologicalDescription, false);
  };

  const applyDialog = async () => {
    const isValid = await formMethods.trigger();
    if (!isDirty || isValid) {
      const values = getValues();
      // A new description (id===0, built by the gap-click handler) must commit on Apply even
      // when the user didn't type anything — that's how an empty placeholder description is
      // attached to the clicked gap.
      const isNew = description?.id === 0;
      updateLithologicalDescription(
        { ...description, ...values } as LithologicalDescription,
        isDirty || (isNew && isValid),
      );
    }
  };

  return (
    <FormDialog
      open={description !== undefined}
      title={t("lithological_description")}
      onClose={cancelDialog}
      onApply={applyDialog}
      isApplyDisabled={!formState.isValid && Object.keys(formState.errors).length > 0}>
      <FormProvider {...formMethods}>
        <BoreholesCard data-cy="lithological-description-basic-data" title={t("basicData")}>
          <FormContainer>
            <FormContainer direction={"row"}>
              <FormInput
                fieldName={"fromDepth"}
                label={"fromdepth"}
                readonly={true}
                value={description?.fromDepth}
                type={FormValueType.Number}
              />
              <FormInput
                fieldName={"toDepth"}
                label={"todepth"}
                readonly={true}
                value={description?.toDepth}
                type={FormValueType.Number}
              />
            </FormContainer>
            <RemarksFormSection fieldName="description" label="remarks" />
          </FormContainer>
        </BoreholesCard>
      </FormProvider>
    </FormDialog>
  );
};
