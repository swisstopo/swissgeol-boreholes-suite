import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MenuItem, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { getFormFieldError } from "./form";

export interface FormSelectProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selected?: number;
  values?: FormSelectValue[];
  sx?: SxProps;
  className?: string;
  onUpdate?: (value: number) => void;
}

export interface FormSelectValue {
  key: number;
  name: string;
}

export interface FormSelectMenuItem {
  key: number;
  value?: number;
  label: string;
  italic?: boolean;
}

export const FormSelect: FC<FormSelectProps> = ({
  fieldName,
  label,
  required,
  disabled,
  readonly,
  selected,
  values,
  sx,
  className,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const menuItems: FormSelectMenuItem[] = [];
  if (!required) {
    menuItems.push({ key: 0, value: undefined, label: t("reset"), italic: true });
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
    <Controller
      name={fieldName}
      control={control}
      defaultValue={selected ?? ""}
      rules={{
        required: required ?? false,
        onChange: e => {
          if (onUpdate) {
            onUpdate(e.target.value);
          }
        },
      }}
      render={({ field, formState }) => (
        <TextField
          select
          required={required ?? false}
          error={getFormFieldError(fieldName, formState.errors)}
          sx={{ ...sx }}
          className={`${readonly ? "readonly" : ""} ${className || ""}`}
          label={t(label)}
          name={field.name}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          value={field.value ?? ""}
          disabled={disabled ?? false}
          data-cy={fieldName + "-formSelect"}
          InputProps={{ readOnly: readonly, disabled: disabled }}>
          {menuItems.map(item => (
            <MenuItem key={item.key} value={item.value}>
              {item.italic ? <em>{item.label}</em> : item.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};
