import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Checkbox, FormControlLabel, SxProps } from "@mui/material";

export interface FormCheckboxProps {
  fieldName: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  sx?: SxProps;
  onChange?: (value: boolean) => void;
}

export const FormCheckbox: FC<FormCheckboxProps> = ({ fieldName, label, checked, disabled, sx, onChange }) => {
  const { t } = useTranslation();
  const { register } = useFormContext();

  return (
    <FormControlLabel
      sx={{ marginTop: "10px!important", marginRight: "10px!important", ...sx }}
      control={
        <Checkbox
          data-cy={fieldName + "-formCheckbox"}
          {...register(fieldName)}
          disabled={disabled || false}
          defaultChecked={checked || false}
          onChange={e => onChange?.(e.target.checked)}
        />
      }
      label={t(label)}
    />
  );
};
