import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";
import { useLabelOverflow } from "./useLabelOverflow.tsx";

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
  const { labelWithTooltip } = useLabelOverflow(label);

  return (
    <TextField
      label={labelWithTooltip}
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
