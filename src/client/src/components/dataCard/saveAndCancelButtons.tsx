import { FC, useContext } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { CancelButton, SaveButton } from "../buttons/buttons.tsx";
import { DataCardButtonContainer } from "./dataCard.tsx";
import { DataCardContext } from "./dataCardContext.tsx";

interface SaveAndCancelButtonsProps {
  onCancel: () => void;
  onSave: () => Promise<void>;
  saveDisabled: boolean;
}
export const SaveAndCancelButtons: FC<SaveAndCancelButtonsProps> = ({ onCancel, onSave, saveDisabled }) => {
  return (
    <DataCardButtonContainer>
      <CancelButton onClick={onCancel} />
      <SaveButton disabled={saveDisabled} onClick={onSave} />
    </DataCardButtonContainer>
  );
};

interface DataCardSaveAndCancelButtonsProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  submitForm: (data: T) => void;
}

export const DataCardSaveAndCancelButtons = <T extends FieldValues>({
  formMethods,
  submitForm,
}: DataCardSaveAndCancelButtonsProps<T>) => {
  const { selectCard } = useContext(DataCardContext);

  return (
    <SaveAndCancelButtons
      onCancel={() => {
        formMethods.reset();
        selectCard(null);
      }}
      onSave={() => formMethods.handleSubmit(submitForm)()}
      saveDisabled={!formMethods.formState.isValid}
    />
  );
};
