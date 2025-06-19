import { FC, useContext } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Autocomplete, SxProps, TextField } from "@mui/material";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { getFormFieldError } from "./form";
import { getFieldBorderColor } from "./formUtils.ts";

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
  const { editingEnabled } = useContext(EditStateContext);
  const isReadOnly = readonly ?? !editingEnabled;

  // Synchronize Autocomplete with react hook form state
  const fieldValue = useWatch({
    control,
    name: fieldName,
  });

  const menuItems: FormSelectMenuItem[] = [];

  if (!isReadOnly && !required && canReset) {
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
      rules={{ required: required ?? false }}
      render={({ field, formState }) => {
        // Display FormSelect as a standard TextField in readonly mode, so that text becomes selectable
        if (isReadOnly) {
          const selectedLabel = menuItems.find(option => option.value === field.value)?.label ?? "";
          return (
            <TextField
              value={selectedLabel}
              label={t(label)}
              InputProps={{ readOnly: isReadOnly, disabled: disabled }}
              sx={{ ...sx, ...getFieldBorderColor(isReadOnly) }}
              className={`readonly ${className ?? ""}`}
              data-cy={fieldName + "-formSelect"}
              disabled={disabled ?? false}
            />
          );
        }
        // Display FormSelect as Autocomplete when editable
        return (
          <Autocomplete
            key={`${fieldName}-${fieldValue ?? "empty"}`}
            sx={{ flex: "1" }}
            options={menuItems}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            value={
              field.value === null || field.value === undefined
                ? undefined
                : menuItems.find(opt => opt.value === field.value)
            }
            onChange={(_, newValue) => {
              if (newValue?.label.toLowerCase() === t("reset").toLowerCase()) {
                // Clear autocomplete if reset option is clicked
                field.onChange(null);
                if (onUpdate) onUpdate(null);
              } else {
                field.onChange(newValue?.key ?? null);
                if (onUpdate) onUpdate(newValue?.key ?? null);
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={t(label)}
                required={required}
                error={getFormFieldError(fieldName, formState.errors)}
                sx={{ ...sx, ...getFieldBorderColor(isReadOnly) }}
                className={className}
                data-cy={fieldName + "-formSelect"}
                disabled={disabled}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>{option.italic ? <em>{option.label}</em> : option.label}</li>
            )}
            disabled={disabled}
            disableClearable
          />
        );
      }}
    />
  );
};
