import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { getInputFieldBackgroundColor } from "./form";

export const FormSelect = props => {
  const { fieldName, label, required, disabled, selected, sx } = props;
  const { t } = useTranslation();
  const { formState, register, setValue } = useFormContext();

  return (
    <TextField
      select
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
      size="small"
      label={t(label)}
      variant="outlined"
      {...register(fieldName, {
        required: required || false,
        onChange: e => {
          setValue(fieldName, e.target.value, { shouldValidate: true });
        },
      })}
      defaultValue={selected || ""}
      disabled={disabled || false}
      data-cy={fieldName + "-formSelect"}
      InputLabelProps={{ shrink: true }}>
      {props.children}
    </TextField>
  );
};
