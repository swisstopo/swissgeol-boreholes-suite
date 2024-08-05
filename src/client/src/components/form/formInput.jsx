import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { FormField, getFormFieldError } from "./form";

export const FormInput = props => {
  const { fieldName, label, required, disabled, type, multiline, rows, value, sx, inputProps, onUpdate } = props;
  const { t } = useTranslation();
  const { formState, register, setValue } = useFormContext();

  const getDefaultValue = value => {
    if (value != null) {
      if (type === "datetime-local") {
        // re-format from 'YYYY-MM-DDTHH:mm:ss.sssZ' to 'YYYY-MM-DDTHH:mm'.
        return value.slice(0, 16);
      } else {
        return value;
      }
    } else {
      return "";
    }
  };

  return (
    <FormField
      name={fieldName}
      required={required || false}
      error={getFormFieldError(fieldName, formState.errors)}
      sx={{ ...sx }}
      type={type || "text"}
      multiline={multiline || false}
      rows={rows}
      label={t(label)}
      {...register(fieldName, {
        required: required || false,
        valueAsNumber: type === "number",
        validate: value => {
          if (value === "") {
            return true;
          }
          if (type === "date" || type === "datetime-local") {
            var date = new Date(value);
            return !isNaN(date) && date.getFullYear() > 1800 && date.getFullYear() < 3000;
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
      InputLabelProps={{ shrink: true }}
      InputProps={{ ...inputProps }}
    />
  );
};
