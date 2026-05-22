import { ChangeEvent, FC, KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SxProps, TextField } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { FormValueType } from "../../../../../components/form/form.ts";
import { getFieldBorderColor, parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { NumericFormatWithThousandSeparator } from "../../../../../components/form/numericFormatWithThousandSeparator.tsx";

interface DepthInputProps {
  value: number;
  hasError?: boolean;
  onCommit: (newDepth: number) => void;
  sx?: SxProps;
  dataCy?: string;
}

export const DepthInput: FC<DepthInputProps> = ({ value, hasError, onCommit, sx, dataCy }) => {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState<string>(String(value));

  useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const commit = () => {
    const parsed = parseFloatWithThousandsSeparator(textValue);
    if (parsed === null || Number.isNaN(parsed)) {
      setTextValue(String(value));
      return;
    }
    if (parsed === value) return;
    onCommit(parsed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setTextValue(String(value));
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <TextField
      label={t("mMd")}
      size="small"
      type={FormValueType.Text}
      value={textValue}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setTextValue(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onClick={(e: MouseEvent) => e.stopPropagation()}
      error={!!hasError}
      data-cy={dataCy}
      sx={{
        backgroundColor: theme.palette.background.default,
        width: "96px",
        ...getFieldBorderColor(false),
        ...sx,
      }}
      slotProps={{
        input: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputComponent: NumericFormatWithThousandSeparator as any,
        },
      }}
    />
  );
};
