import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Checkbox, FormControlLabel, SxProps } from "@mui/material";

export interface FormCheckboxProps {
  fieldName: string;
  label: string;
  disabled?: boolean;
  sx?: SxProps;
  onChange?: (value: boolean) => void;
}

export const FormCheckbox: FC<FormCheckboxProps> = ({ fieldName, label, disabled, sx, onChange }) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          sx={{ marginTop: "10px!important", marginRight: "10px!important", ...sx }}
          control={
            <Checkbox
              data-cy={fieldName + "-formCheckbox"}
              {...field}
              checked={!!field.value}
              disabled={disabled || false}
              onChange={e => {
                field.onChange(e.target.checked);
                onChange?.(e.target.checked);
              }}
            />
          }
          label={t(label)}
        />
      )}
    />
  );
};
