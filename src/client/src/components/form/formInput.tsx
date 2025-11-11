import { FC, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputProps, SxProps, TextField } from "@mui/material";
import { isValid } from "date-fns";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { FormValueType, getFormFieldError } from "./form";
import { getFieldBorderColor } from "./formUtils.ts";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";
import { useLabelOverflow } from "./useLabelOverflow.tsx";

export interface FormInputProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: FormValueType;
  multiline?: boolean;
  rows?: number;
  value?: string | number | Date | null;
  controlledValue?: string | number | Date;
  sx?: SxProps;
  className?: string;
  inputProps?: InputProps;
  onUpdate?: (value: string) => void;
  withThousandSeparator?: boolean;
  placeholder?: string;
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
  placeholder,
}) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { formState, register, setValue } = useFormContext();
  const isDateTimeInput = type === FormValueType.DateTime;
  const isDateInput = type === FormValueType.Date;
  const isReadOnly = readonly ?? !editingEnabled;
  const { labelWithTooltip } = useLabelOverflow(label);

  const getDefaultValue = (value: string | number | Date | undefined | null) => {
    if (value == undefined) {
      return "";
    } else if (isDateTimeInput) {
      // re-format from 'YYYY-MM-DDTHH:mm:ss.sssZ' to 'YYYY-MM-DDTHH:mm'.
      return (value as string).slice(0, 16);
    } else {
      return value;
    }
  };

  const formFieldError = getFormFieldError(fieldName, formState.errors);

  return (
    <TextField
      required={required || false}
      error={!!formFieldError}
      helperText={formFieldError?.message ? t(formFieldError.message) : ""}
      sx={{
        flex: "1",
        ...sx,
        ...getFieldBorderColor(isReadOnly),
      }}
      className={`${isReadOnly ? "readonly" : ""} ${className ?? ""}`}
      type={type || FormValueType.Text}
      multiline={multiline || false}
      placeholder={placeholder && t(placeholder)}
      rows={rows}
      label={labelWithTooltip}
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
      slotProps={{
        input: {
          ...inputProps /* eslint-disable  @typescript-eslint/no-explicit-any */,
          ...(withThousandSeparator && { inputComponent: NumericFormatWithThousandSeparator as any }),
          ...(isDateTimeInput && { max: "9999-01-01T00:00" }),
          ...(isDateInput && { max: "9999-01-01" }),
          readOnly: isReadOnly,
          disabled: disabled,
        },
      }}
    />
  );
};
