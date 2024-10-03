import { FC } from "react";
import { useTranslation } from "react-i18next";
import { InputProps, SxProps, TextField } from "@mui/material";
import { FormValueType } from "./form.ts";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";

interface SimpleInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: FormValueType;
  multiline?: boolean;
  rows?: number;
  value?: string | number | Date | null;
  sx?: SxProps;
  className?: string;
  inputProps?: InputProps;
  onUpdate?: (value: string) => void;
  withThousandSeparator?: boolean;
}

// This component is needed as an intermediate step to refactor borehole input.
// The standard form components are not usable with autosave components as they are now.
// Once the saving mechanism is refactored, this component can be replaced.

export const SimpleFormInput: FC<SimpleInputProps> = ({
  value,
  className,
  required,
  readonly,
  rows,
  onUpdate,
  label,
  type,
  multiline,
  withThousandSeparator,
  inputProps,
  disabled,
  sx,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      required={required || false}
      sx={{ ...sx }}
      className={`${readonly ? "readonly" : ""} ${className || ""}`}
      type={type || FormValueType.Text}
      multiline={multiline || false}
      rows={rows}
      value={value}
      label={t(label)}
      data-cy={label + "-formInput"}
      onChange={e => {
        if (onUpdate) {
          onUpdate(e.target.value);
        }
      }}
      InputProps={{
        ...inputProps /* eslint-disable  @typescript-eslint/no-explicit-any */,
        ...(withThousandSeparator && { inputComponent: NumericFormatWithThousandSeparator as any }),
        readOnly: readonly,
        disabled: disabled,
      }}
    />
  );
};
