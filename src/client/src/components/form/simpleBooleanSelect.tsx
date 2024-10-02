import { FC } from "react";
import { useTranslation } from "react-i18next";
import { MenuItem, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { FormSelectMenuItem, FormSelectValue } from "./simpleDomainSelect.tsx";

// This component is needed as an intermediate step to refactor borehole input.
// The standard form components are not usable with autosave components as they are now.
// Once the saving mechanism is refactored, this component can be replaced.

interface SimpleBooleanSelectProps {
  fieldName: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selected?: number | boolean | null;
  values?: FormSelectValue[];
  sx?: SxProps;
  className?: string;
  onUpdate?: (value: number | boolean | string | null) => void;
}

export const SimpleBooleanSelect: FC<SimpleBooleanSelectProps> = ({
  fieldName,
  label,
  required,
  disabled,
  readonly,
  selected,
  sx,
  className,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const menuItems: FormSelectMenuItem[] = [];
  if (!required) {
    menuItems.push({ key: 0, value: undefined, label: t("reset"), italic: true });
  }

  const value = selected === true ? 1 : selected === false ? 0 : 2;

  const values = [
    { key: 1, name: t("yes") },
    { key: 0, name: t("no") },
    { key: 2, name: t("np") },
  ];

  values.forEach(v =>
    menuItems.push({
      key: v.key,
      value: v.key,
      label: v.name,
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
      onChange={e =>
        onUpdate
          ? onUpdate(parseInt(e.target.value) === 1 ? true : parseInt(e.target.value) === 0 ? false : null)
          : null
      }
      value={value}
      disabled={disabled ?? false}
      data-cy={fieldName + "-formSelect"}
      InputProps={{ readOnly: readonly, disabled: disabled }}>
      {menuItems.map(item => (
        <MenuItem key={item.key} value={item.value}>
          {item.italic ? <em>{item.label}</em> : item.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
