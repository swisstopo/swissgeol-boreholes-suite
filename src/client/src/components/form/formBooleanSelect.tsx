import { FC } from "react";
import { useTranslation } from "react-i18next";
import { FormSelect } from "./form";
import { FormSelectProps } from "./formSelect.tsx";

export interface FormBooleanSelectProps extends FormSelectProps {
  label: string;
  selected?: boolean | null | undefined;
  allowUndefined?: boolean;
}

export const FormBooleanSelect: FC<FormBooleanSelectProps> = props => {
  const { label, selected, onUpdate, allowUndefined = true } = props;
  const { t } = useTranslation();
  let value: number | undefined;
  if (selected === true) {
    value = 1;
  } else if (selected === false) {
    value = 0;
  } else if (selected === null && allowUndefined) {
    value = 2;
  } else {
    value = undefined;
  }

  const options = [
    { key: 1, name: t("yes") },
    { key: 0, name: t("no") },
  ];
  if (allowUndefined) {
    options.push({ key: 2, name: t("np") });
  }

  return (
    <FormSelect
      {...props}
      label={label}
      selected={value}
      onUpdate={e => (onUpdate ? onUpdate(e === 1 ? true : e === 0 ? false : null) : null)}
      values={options}
    />
  );
};
