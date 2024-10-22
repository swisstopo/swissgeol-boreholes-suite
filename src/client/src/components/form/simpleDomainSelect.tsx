import { FC } from "react";
import { useTranslation } from "react-i18next";
import { MenuItem, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { useDomains } from "../../api/fetchApiV2";
import { Codelist } from "../legacyComponents/domain/domainInterface.ts";
import { FormSelectMenuItem } from "./formSelect.tsx";

// This component is needed as an intermediate step to refactor borehole input.
// The standard form components are not usable with autosave components as they are now.
// Once the saving mechanism is refactored, this component can be replaced.

interface SimpleDomainSelectProps {
  fieldName: string;
  schemaName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selected?: number | boolean | null;
  sx?: SxProps;
  className?: string;
  onUpdate?: (value: number | null) => void;
}

export const SimpleDomainSelect: FC<SimpleDomainSelectProps> = ({
  fieldName,
  label,
  required,
  disabled,
  readonly,
  selected,
  schemaName,
  sx,
  className,
  onUpdate,
}) => {
  const { t, i18n } = useTranslation();
  const { data: domains } = useDomains();

  const menuItems: FormSelectMenuItem[] = [];
  if (!required) {
    menuItems.push({ key: 0, value: undefined, label: t("reset"), italic: true });
  }
  domains
    ?.filter((d: Codelist) => d.schema === schemaName)
    .sort((a: Codelist, b: Codelist) => a.order - b.order)
    .forEach((d: Codelist) =>
      menuItems.push({
        key: d.id,
        value: d.id,
        label: d[i18n.language] as string,
      }),
    );

  return (
    <TextField
      required={required}
      className={`${readonly ? "readonly" : ""} ${className || ""}`}
      select
      sx={{ ...sx }}
      label={t(label)}
      name={fieldName}
      onChange={e => {
        if (onUpdate) {
          onUpdate(parseInt(e.target.value));
        }
      }}
      value={selected}
      disabled={disabled ?? false}
      data-cy={fieldName + "-formSelect"}
      InputProps={{ readOnly: readonly, disabled: disabled }}>
      {menuItems.map(item => (
        <MenuItem key={item.key} value={item.value as number}>
          {item.italic ? <em>{item.label}</em> : item.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
