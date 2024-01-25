import { Checkbox, FormControlLabel } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";

export const FormCheckbox = props => {
  const { fieldName, label, checked, disabled, sx } = props;
  const { t } = useTranslation();
  const { register } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Checkbox
          data-cy={fieldName + "-formCheckbox"}
          {...register(fieldName)}
          disabled={disabled || false}
          defaultChecked={checked || false}
        />
      }
      label={t(label)}
      sx={{ ...sx }}
    />
  );
};
