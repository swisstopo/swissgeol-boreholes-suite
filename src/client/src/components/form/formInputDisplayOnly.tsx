import React from "react";
import { useTranslation } from "react-i18next";
import { TextField, TextFieldProps } from "@mui/material";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";

interface FormInputDisplayOnlyProps extends Omit<TextFieldProps, "value"> {
  label: string;
  value: number | null;
  withThousandSeparator?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export const FormInputDisplayOnly: React.FC<FormInputDisplayOnlyProps> = ({
  label,
  value,
  withThousandSeparator,
  readOnly = true,
  disabled = true,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <TextField
      label={t(label)}
      data-cy={label + "-formInput"}
      value={value}
      InputProps={{
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        ...(withThousandSeparator && { inputComponent: NumericFormatWithThousandSeparator as any }),
        readOnly: readOnly,
        disabled: disabled,
        ...props.InputProps,
      }}
      className="readonly"
      {...props}
    />
  );
};
