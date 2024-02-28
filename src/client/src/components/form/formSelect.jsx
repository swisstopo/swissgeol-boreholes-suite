import { MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { FormField, getInputFieldBackgroundColor } from "./form";

export const FormSelect = props => {
  const { fieldName, label, required, disabled, selected, values, sx, onUpdate } = props;
  const { t } = useTranslation();
  const { formState, register, setValue } = useFormContext();

  var menuItems = [];
  if (required !== true) {
    menuItems.push({ key: "0", value: null, label: t("reset"), italic: true });
  }
  if (values) {
    values.forEach(value => {
      menuItems.push({
        key: value.key,
        value: value.key,
        label: value.name,
      });
    });
  }

  return (
    <FormField
      select
      name={fieldName}
      required={required || false}
      sx={{
        backgroundColor: getInputFieldBackgroundColor(formState.errors[fieldName]),
        ...sx,
      }}
      size="small"
      label={t(label)}
      variant="outlined"
      {...register(fieldName, {
        required: required || false,
        onChange: e => {
          setValue(fieldName, e.target.value, { shouldValidate: true });
          if (onUpdate) {
            onUpdate(e.target.value);
          }
        },
      })}
      defaultValue={selected || ""}
      disabled={disabled || false}
      data-cy={fieldName + "-formSelect"}
      InputLabelProps={{ shrink: true }}>
      {menuItems.map(item => (
        <MenuItem key={item.key} value={item.value}>
          {item.italic ? <em>{item.label}</em> : item.label}
        </MenuItem>
      ))}
    </FormField>
  );
};
