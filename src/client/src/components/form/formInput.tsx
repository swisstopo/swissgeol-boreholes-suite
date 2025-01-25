import { FC, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputProps, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { isValid } from "date-fns";
import { DetailContext } from "../../pages/detail/detailContext.tsx";
import { FormValueType, getFormFieldError } from "./form";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";

export interface FormInputProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: FormValueType;
  multiline?: boolean;
  rows?: number;
  value?: string | number | Date;
  controlledValue?: string | number | Date;
  sx?: SxProps;
  className?: string;
  inputProps?: InputProps;
  onUpdate?: (value: string) => void;
  withThousandSeparator?: boolean;
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
  value, // default value passed to the Textfield component
  controlledValue, // value to be controlled with react-hook-form state, it is needed to correctly reset values with thousands separator
  sx,
  className,
  inputProps,
  onUpdate,
  withThousandSeparator,
}) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const { formState, register, setValue } = useFormContext();
  const isDateTimeInput = type === FormValueType.DateTime;
  const isDateInput = type === FormValueType.Date;
  const isReadOnly = readonly != undefined ? readonly : !editingEnabled;

  const getDefaultValue = (value: string | number | Date | undefined) => {
    if (value == undefined) {
      return "";
    } else if (isDateTimeInput) {
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
      className={`${isReadOnly ? "readonly" : ""} ${className ?? ""}`}
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
          if (isDateInput || isDateTimeInput) {
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
      value={controlledValue}
      disabled={disabled || false}
      data-cy={fieldName + "-formInput"}
      InputProps={{
        ...inputProps /* eslint-disable  @typescript-eslint/no-explicit-any */,
        ...(withThousandSeparator && { inputComponent: NumericFormatWithThousandSeparator as any }),
        ...(isDateTimeInput && { inputProps: { max: "9999-01-01T00:00" } }),
        ...(isDateInput && { inputProps: { max: "9999-01-01" } }),
        readOnly: readonly,
        disabled: disabled,
      }}
    />
  );
};
