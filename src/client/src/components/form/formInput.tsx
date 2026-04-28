import { FC, useContext, useEffect } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputProps, SxProps, TextField } from "@mui/material";
import { isValid } from "date-fns";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { FormValueType, getFormFieldError } from "./form";
import { getFieldBorderColor } from "./formUtils.ts";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";
import { useLabelOverflow } from "./useLabelOverflow.tsx";

const toFormatterValue = (v: string | number | Date | null | undefined): string => {
  if (v == null) return "";
  if (typeof v === "number") return String(v);
  return v as string;
};

interface FormInputProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: FormValueType;
  multiline?: boolean;
  rows?: number;
  value?: string | number | Date | null;
  sx?: SxProps;
  className?: string;
  inputProps?: InputProps;
  onUpdate?: (value: string) => void;
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
  value,
  sx,
  className,
  inputProps,
  onUpdate,
  placeholder,
}) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { register, setValue, control, getValues } = useFormContext();
  const { errors } = useFormState({ control, name: fieldName });
  const isDateTimeInput = type === FormValueType.DateTime;
  const isDateInput = type === FormValueType.Date;
  const isNumberInput = type === FormValueType.Number;
  const isReadOnly = readonly ?? !editingEnabled;
  const { labelWithTooltip } = useLabelOverflow(label);

  // Read the form value so the input can be controlled by it.
  // Without controlled mode, the formatter rewrites the number on mount and marks the field dirty.
  const watchedValue = useWatch({ control, name: fieldName, disabled: !isNumberInput });

  // On mount, push the initial value into the form if nothing is there yet.
  // Required validation reads the form value, so without this it always fails.
  // We store it as a string to match what the formatter writes back when the user types.
  useEffect(() => {
    if (isNumberInput && value != null && getValues(fieldName) === undefined) {
      setValue(fieldName, toFormatterValue(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // What the input shows: the form value if it has one, otherwise the prop.
  // On the first render the form is still empty; without the prop fallback the input would
  // flash empty and then jump to the value, and that jump would be treated as a user change.
  const controlledValue = toFormatterValue(watchedValue ?? value);

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

  const formFieldError = getFormFieldError(fieldName, errors);

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
      type={isNumberInput ? FormValueType.Text : type || FormValueType.Text} // Numeric values need to be of type text due to the thousands separators
      multiline={multiline || false}
      placeholder={placeholder && t(placeholder)}
      rows={rows}
      label={labelWithTooltip}
      {...register(fieldName, {
        required: required ? "required" : false,
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
      value={isNumberInput ? controlledValue : undefined}
      disabled={disabled || false}
      data-cy={fieldName + "-formInput"}
      slotProps={{
        input: {
          ...inputProps /* eslint-disable  @typescript-eslint/no-explicit-any */,
          ...(isNumberInput && { inputComponent: NumericFormatWithThousandSeparator as any }),
          ...(isDateTimeInput && { max: "9999-01-01T00:00" }),
          ...(isDateInput && { max: "9999-01-01" }),
          readOnly: isReadOnly,
          disabled: disabled,
        },
      }}
    />
  );
};
