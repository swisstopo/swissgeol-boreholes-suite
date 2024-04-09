import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FormDisplayType } from "./formDisplayType";

/**
 * Renders a form display component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.prefix - The prefix for the data-cy attribute.
 * @param {string} props.label - The label for the form display.
 * @param {any} props.value - The value to be displayed.
 * @param {string} props.type - The type of the form display.
 * @param {Object} props.sx - The custom styling for the component.
 * @returns {JSX.Element} The rendered form display component.
 */
export const FormDisplay = props => {
  const { prefix, label, value, type, sx } = props;
  const { t, i18n } = useTranslation();

  const convert = value => {
    if ((value !== 0 && value == null) || value === "") {
      return "-";
    } else if (type === FormDisplayType.Date) {
      const date = new Date(value);
      const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return dateTimeFormat.format(date);
    } else if (type === FormDisplayType.DateTime) {
      const date = new Date(value);
      const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
      return dateTimeFormat.format(date);
    } else if (type === FormDisplayType.Boolean) {
      return value ? t("yes") : t("no");
    } else if (type === FormDisplayType.Domain) {
      return value?.[i18n.language];
    } else {
      return value;
    }
  };

  const formatValue = value => {
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
      <Typography marginBottom={"1em"} variant="subtitle1" data-cy={(prefix || "") + label + "-formDisplay"}>
        {formatValue(value)}
      </Typography>
    </Stack>
  );
};
