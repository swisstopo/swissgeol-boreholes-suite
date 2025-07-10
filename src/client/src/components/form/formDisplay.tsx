import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Stack, SxProps, Typography } from "@mui/material";
import { Language } from "@swissgeol/ui-core";
import { Codelist } from "../codelist.ts";
import { FormValueType } from "./form";
import { formatNumberForDisplay } from "./formUtils.ts";

export interface FormDisplayProps {
  prefix?: string;
  label: string;
  value: string | string[] | number | number[] | boolean | Codelist | Codelist[] | null;
  type?: FormValueType;
  sx?: SxProps;
}

export const FormDisplay: FC<FormDisplayProps> = ({ prefix, label, value, type, sx }) => {
  const { t, i18n } = useTranslation();

  const convert = (value: string | number | boolean | Codelist | undefined | null): string => {
    if ((value !== 0 && value == undefined) || value === "") {
      return "-";
    } else if (type === FormValueType.Number) {
      return formatNumberForDisplay(value as number);
    } else if (type === FormValueType.Date) {
      const date = new Date(value as string);
      const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return dateTimeFormat.format(date);
    } else if (type === FormValueType.DateTime) {
      const date = new Date(value as string);
      const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
      return dateTimeFormat.format(date);
    } else if (type === FormValueType.Boolean) {
      return value ? t("yes") : t("no");
    } else if (type === FormValueType.Domain) {
      const codelist = value as Codelist;
      return codelist[i18n.language as Language];
    } else {
      return value as string;
    }
  };

  const formatValue = (
    value: string | string[] | number | number[] | boolean | Codelist | Codelist[] | null,
  ): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "-";
      }
      return value.map(v => convert(v)).join(", ");
    } else {
      return convert(value);
    }
  };

  return (
    <Stack
      direction="column"
      sx={{
        flex: "1 1 0",
        ...sx,
      }}>
      <Typography variant="subtitle2">{t(label)}</Typography>
      <Typography marginBottom={"1em"} variant="subtitle1" data-cy={(prefix ?? "") + label + "-formDisplay"}>
        {formatValue(value)}
      </Typography>
    </Stack>
  );
};
