import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { FormField, getInputFieldBackgroundColor } from "./form";

export const FormInput = props => {
  const {
    fieldName,
    label,
    required,
    disabled,
    type,
    multiline,
    rows,
    value,
    sx,
    inputProps,
  } = props;
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

  const isValidDate = dateString => {
    var regex = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;
    var matches = dateString.match(regex);
    if (!matches) {
      return false;
    }

    var year = parseInt(matches[1], 10);
    var month = parseInt(matches[2], 10) - 1;
    var day = parseInt(matches[3], 10);
    var hour = matches[4] ? parseInt(matches[4], 10) : 0;
    var minute = matches[5] ? parseInt(matches[5], 10) : 0;

    var date = new Date(year, month, day, hour, minute);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return false;
    }

    return true;
  };

  return (
    <FormField
      name={fieldName}
      required={required || false}
      sx={{
        backgroundColor: getInputFieldBackgroundColor(
          formState.errors[fieldName],
        ),
        ...sx,
      }}
      type={type || "text"}
      multiline={multiline || false}
      rows={rows}
      size="small"
      label={t(label)}
      variant="outlined"
      {...register(fieldName, {
        required: required || false,
        valueAsNumber: type === "number" ? true : false,
        validate: value => {
          if (type === "date" || type === "datetime-local") {
            return isValidDate(value);
          }
          return true;
        },
        onChange: e => {
          setValue(fieldName, e.target.value, { shouldValidate: true });
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
