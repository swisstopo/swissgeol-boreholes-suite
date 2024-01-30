import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { getInputFieldBackgroundColor } from "./form";

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

  return (
    <TextField
      name={fieldName}
      required={required || false}
      sx={{
        backgroundColor: getInputFieldBackgroundColor(
          formState.errors[fieldName],
        ),
        borderRadius: "4px",
        flex: "1",
        marginTop: "10px !important",
        marginRight: "10px !important",
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
