import { FC, useContext } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MenuItem, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { DetailContext } from "../../pages/detail/detailContext.tsx";
import { getFieldBorderColor } from "../legacyComponents/formUtils.ts";
import { getFormFieldError } from "./form";

export interface FormSelectProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selected?: number | boolean | null;
  values?: FormSelectValue[];
  sx?: SxProps;
  className?: string;
  onUpdate?: (value: number | boolean | null) => void;
  canReset?: boolean;
}

export interface FormSelectValue {
  key: number;
  name: string;
}

export interface FormSelectMenuItem {
  key: number;
  value?: number | null;
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
  canReset = true, // option to disable reset in dropdown without using the required rule and error display
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { editingEnabled } = useContext(DetailContext);
  const isReadOnly = readonly ?? !editingEnabled;

  const menuItems: FormSelectMenuItem[] = [];
  if (!required && canReset) {
    menuItems.push({ key: 0, value: null, label: t("reset"), italic: true });
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
          const value = e.target.value === "" ? null : e.target.value;
          if (onUpdate) {
            onUpdate(value);
          }
        },
      }}
      render={({ field, formState }) => (
        <TextField
          select
          required={required ?? false}
          error={getFormFieldError(fieldName, formState.errors)}
          sx={{
            ...sx,
            ...getFieldBorderColor(isReadOnly),
          }}
          className={`${isReadOnly ? "readonly" : ""} ${className ?? ""}`}
          label={t(label)}
          name={field.name}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          value={field.value ?? ""}
          disabled={disabled ?? false}
          data-cy={fieldName + "-formSelect"}
          InputProps={{ readOnly: isReadOnly, disabled: disabled }}>
          {menuItems.map(item => (
            <MenuItem key={item.key} value={item.value as number}>
              {item.italic ? <em>{item.label}</em> : item.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};
