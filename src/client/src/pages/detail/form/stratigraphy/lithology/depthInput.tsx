import { ChangeEvent, FC, KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { FormValueType } from "../../../../../components/form/form.ts";
import { getFieldBorderColor, parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { NumericFormatWithThousandSeparator } from "../../../../../components/form/numericFormatWithThousandSeparator.tsx";

interface DepthInputProps {
  value: number;
  hasError?: boolean;
  onCommit: (newDepth: number) => void;
  position?: "first" | "last" | "default";
  dataCy?: string;
}

export const DepthInput: FC<DepthInputProps> = ({ value, hasError, onCommit, position = "default", dataCy }) => {
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
        position: "absolute",
        left: "50%",
        width: "96px",
        backgroundColor: theme.palette.background.default,
        ...getFieldBorderColor(false),
        ...(position === "first"
          ? { top: theme.spacing(2), transform: "translateX(-50%)" }
          : position === "last"
            ? { bottom: theme.spacing(2), transform: "translateX(-50%)" }
            : { bottom: 0, transform: "translate(-50%, 50%)", zIndex: 1 }),
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
