import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputProps, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { isValid } from "date-fns";

import { FormValueType, getFormFieldError } from "./form";

export interface FormInputProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: FormValueType;
  multiline?: boolean;
  rows?: number;
  value?: string | number;
  sx?: SxProps;
  className?: string;
  inputProps?: InputProps;
  onUpdate?: (value: string) => void;
}

export const FormInput: FC<FormInputProps> = ({
  fieldName,
  label,
  required,
  disabled,
  readonly,
  type,
  multiline,
  rows,
  value,
  sx,
  className,
  inputProps,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { formState, register, setValue } = useFormContext();

  const getDefaultValue = (value: string | number | undefined) => {
    if (value == undefined) {
      return "";
    } else if (type === FormValueType.DateTime) {
      // re-format from 'YYYY-MM-DDTHH:mm:ss.sssZ' to 'YYYY-MM-DDTHH:mm'.
      return (value as string).slice(0, 16);
    } else {
      return value;
    }
  };

  return (
    <TextField
      required={required || false}
      error={getFormFieldError(fieldName, formState.errors)}
      sx={{ ...sx }}
      className={`${readonly ? "readonly" : ""} ${className || ""}`}
      type={type || FormValueType.Text}
      multiline={multiline || false}
      rows={rows}
      label={t(label)}
      {...register(fieldName, {
        required: required || false,
        valueAsNumber: type === FormValueType.Number,
        validate: value => {
          if (value === "") {
            return true;
          }
          if (type === FormValueType.Date || type === FormValueType.DateTime) {
            const date = new Date(value);
            return isValid(date) && date.getFullYear() > 1800 && date.getFullYear() < 3000;
          }
          return true;
        },
        onChange: e => {
          setValue(fieldName, e.target.value, { shouldValidate: true });
          if (onUpdate) {
            onUpdate(e.target.value);
          }
        },
      })}
      defaultValue={getDefaultValue(value)}
      disabled={disabled || false}
      data-cy={fieldName + "-formInput"}
      InputProps={{ ...inputProps, readOnly: readonly, disabled: disabled }}
    />
  );
};
