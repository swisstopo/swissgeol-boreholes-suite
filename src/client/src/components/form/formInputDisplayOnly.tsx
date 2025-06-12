import React from "react";
import { useTranslation } from "react-i18next";
import { TextField, TextFieldProps } from "@mui/material";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";

interface FormInputDisplayOnlyProps extends Omit<TextFieldProps, "value"> {
  label: string;
  value: number | string | null | undefined;
  withThousandSeparator?: boolean;
  disabled?: boolean;
}

export const FormInputDisplayOnly: React.FC<FormInputDisplayOnlyProps> = ({
  label,
  value,
  withThousandSeparator,
  disabled = true,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <TextField
      label={t(label)}
      data-cy={label + "-formInput"}
      value={value}
      className="readonly"
      InputProps={{
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        ...(withThousandSeparator && { inputComponent: NumericFormatWithThousandSeparator as any }),
        readOnly: true,
        disabled: disabled,
        ...props.InputProps,
      }}
      {...props}
    />
  );
};
