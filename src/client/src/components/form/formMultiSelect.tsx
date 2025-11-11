import { FC, useContext } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Autocomplete, Chip, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { getFormFieldError } from "./form";
import { FormSelectMenuItem } from "./formSelect.tsx";
import { getFieldBorderColor } from "./formUtils.ts";
import { useLabelOverflow } from "./useLabelOverflow.tsx";

export interface FormMultiSelectProps {
  fieldName: string;
  label: string;
  tooltipLabel?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selected?: number[];
  values?: FormMultiSelectValue[];
  sx?: SxProps;
  className?: string;
  renderTagLabel?: (option: FormSelectMenuItem) => string;
}

export interface FormMultiSelectValue {
  key: number;
  name: string;
}

export const FormMultiSelect: FC<FormMultiSelectProps> = ({
  fieldName,
  label,
  tooltipLabel,
  required,
  disabled,
  readonly,
  selected,
  values,
  sx,
  className,
  renderTagLabel,
}) => {
  const { t } = useTranslation();
  const { formState, register, setValue, control } = useFormContext();
  const { editingEnabled } = useContext(EditStateContext);
  const { labelWithTooltip } = useLabelOverflow(label);
  const isReadOnly = readonly ?? !editingEnabled;

  // Synchronize Autocomplete with react hook form state
  const fieldValue = useWatch({
    control,
    name: fieldName,
  });

  const formFieldError = getFormFieldError(fieldName, formState.errors);

  const menuItems: FormSelectMenuItem[] = [];
  if (!required) {
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

  const readonlyStyles = {
    pointerEvents: "none",
    "& .MuiAutocomplete-endAdornment": { display: "none !important" },
  };

  // Without the controller the textfield is not updated when a value is removed by clicking the delete icon on the chip.
  // Check value length to avoid MUI console error: `children` must be passed when using the `TextField` component with `select`.
  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={selected || []}
      render={({ field }) => (
        <>
          {Array.isArray(values) && values.length > 0 ? (
            <Autocomplete
              sx={{ ...(isReadOnly ? readonlyStyles : {}), flex: "1" }}
              key={`${fieldName}-${fieldValue ? fieldValue.join("-") : "empty"}`}
              multiple
              options={menuItems}
              disableCloseOnSelect
              readOnly={isReadOnly}
              getOptionLabel={option => option.label}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              value={
                field.value?.map(
                  (val: number) =>
                    menuItems.find(item => item.value === val) || { key: val, value: val, label: val.toString() },
                ) || []
              }
              onChange={(_, newValues: FormSelectMenuItem[]) => {
                if (newValues.some(m => m.label.toLowerCase() === t("reset").toLowerCase())) {
                  // Clear autocomplete if reset option is clicked
                  field.onChange([]);
                } else {
                  const selectedValues = newValues.map(item => item.value);
                  field.onChange(selectedValues);
                  setValue(fieldName, selectedValues, { shouldValidate: true, shouldDirty: true });
                }
              }}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => {
                  const label = renderTagLabel ? renderTagLabel(option) : option.label;
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      sx={{ height: "26px" }}
                      label={label}
                      title={tooltipLabel ? t(tooltipLabel) : undefined}
                      {...chipProps}
                      data-cy={`chip-${label}`}
                    />
                  );
                });
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={labelWithTooltip}
                  required={required}
                  error={!!formFieldError}
                  helperText={formFieldError?.message ? t(formFieldError.message) : ""}
                  sx={{ ...sx, ...getFieldBorderColor(isReadOnly) }}
                  className={className}
                  data-cy={fieldName + "-formMultiSelect"}
                  disabled={disabled}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    {option.italic ? <em>{option.label}</em> : option.label}
                  </li>
                );
              }}
              disabled={disabled}
            />
          ) : (
            <TextField
              {...field}
              required={required || false}
              error={!!formFieldError}
              helperText={formFieldError?.message ? t(formFieldError.message) : ""}
              sx={{ ...sx }}
              className={`${readonly ? "readonly" : ""} ${className ?? ""}`}
              label={labelWithTooltip}
              {...register(fieldName, {
                required: required || false,
              })}
              value={[]}
              disabled
              data-cy={fieldName + "-formMultiSelect"}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: readonly, disabled: disabled }}
            />
          )}
        </>
      )}
    />
  );
};
