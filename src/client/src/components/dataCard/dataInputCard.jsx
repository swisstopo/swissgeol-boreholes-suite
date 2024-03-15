import { useContext, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { DataCardContext, DataCardSwitchContext } from "../dataCard/dataCardContext";
import { StackFullWidth } from "../baseComponents";
import { CancelButton, SaveButton } from "../buttons/buttons";
import Prompt from "../prompt/prompt";

export const DataInputCard = props => {
  const { item, addData, updateData, prepareFormDataForSubmit } = props;
  const { triggerReload, selectCard } = useContext(DataCardContext);
  const { checkIsDirty, leaveInput } = useContext(DataCardSwitchContext);
  const formMethods = useForm({ mode: "all" });
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  useEffect(() => {
    if (checkIsDirty) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        setShowSavePrompt(true);
      } else {
        leaveInput(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIsDirty]);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addData({
        ...data,
      }).then(() => {
        triggerReload();
      });
    } else {
      updateData({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <StackFullWidth spacing={1}>{props.children}</StackFullWidth>
          <DataCardButtonContainer>
            <CancelButton
              onClick={() => {
                formMethods.reset();
                selectCard(null);
              }}
            />
            <SaveButton
              disabled={!formMethods.formState.isValid}
              onClick={() => formMethods.handleSubmit(submitForm)()}
            />
          </DataCardButtonContainer>
        </form>
      </FormProvider>
      <Prompt
        open={showSavePrompt}
        setOpen={setShowSavePrompt}
        titleLabel="unsavedChangesTitle"
        messageLabel="unsavedChangesMessage"
        actions={[
          {
            label: "cancel",
            action: () => {
              leaveInput(false);
            },
          },
          {
            label: "reset",
            action: () => {
              formMethods.reset();
              selectCard(null);
              leaveInput(true);
            },
          },
          {
            label: "save",
            disabled: !formMethods.formState.isValid,
            action: () => {
              formMethods.handleSubmit(submitForm)();
            },
          },
        ]}
      />
    </>
  );
};

export default DataInputCard;
