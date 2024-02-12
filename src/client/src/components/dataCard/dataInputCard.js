import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { BdmsIconButton } from "../buttons/buttons";
import { StackFullWidth } from "../baseComponents";

export const DataInputCard = props => {
  const { item, setSelected, addData, updateData, prepareFormDataForSubmit } =
    props;
  const formMethods = useForm();

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
      });
    } else {
      updateData({
        ...item,
        ...data,
      });
    }
  };

  const closeFormIfCompleted = () => {
    if (formMethods.formState.isValid) {
      formMethods.handleSubmit(submitForm)();
      setSelected(null);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <StackFullWidth spacing={1}>{props.children}</StackFullWidth>
        <DataCardButtonContainer>
          <BdmsIconButton
            icon={<CancelIcon />}
            tooltipLabel={"cancel"}
            onClick={() => {
              formMethods.reset();
              setSelected(null);
            }}
          />
          <BdmsIconButton
            icon={<SaveIcon />}
            tooltipLabel={"save"}
            disabled={!formMethods.formState.isValid}
            onClick={() => closeFormIfCompleted()}
          />
        </DataCardButtonContainer>
      </form>
    </FormProvider>
  );
};

export default DataInputCard;
