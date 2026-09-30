import { ElementType, FC } from "react";
import { InputBaseComponentProps, TextField, TextFieldProps } from "@mui/material";
import { FormValueType } from "./form";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";
import { useLabelOverflow } from "./useLabelOverflow.tsx";

interface FormInputDisplayOnlyProps extends Omit<TextFieldProps, "value" | "type"> {
  label: string;
  value: number | string | null | undefined;
  type?: FormValueType;
  disabled?: boolean;
}

export const FormInputDisplayOnly: FC<FormInputDisplayOnlyProps> = ({
  label,
  value,
  type,
  disabled = true,
  ...props
}) => {
  const { labelWithTooltip } = useLabelOverflow(label);
  const isNumberInput = type === FormValueType.Number;

  return (
    <TextField
      {...props}
      label={labelWithTooltip}
      data-cy={label + "-formInput"}
      value={value}
      type={isNumberInput ? FormValueType.Text : type || FormValueType.Text} // Numeric values need to be of type text due to the thousands separators
      className="readonly"
      slotProps={{
        input: {
          ...(isNumberInput && {
            inputComponent: NumericFormatWithThousandSeparator as ElementType<InputBaseComponentProps>,
          }),
          readOnly: true,
          disabled: disabled,
        },
      }}
    />
  );
};
