import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import { useDebounce } from "@uidotdev/usehooks";
import { SearchData } from "./filterData/filterInterfaces.ts";

interface FilterTextFieldProps {
  item: SearchData;
  filterValue: string | null;
  onUpdate: (value: string | null) => void;
  type?: string;
  labelKeySuffix?: string;
  debounceMs?: number;
}

export const FilterTextField: FC<FilterTextFieldProps> = ({
  item,
  filterValue,
  onUpdate,
  type,
  labelKeySuffix,
  debounceMs = 1000,
}) => {
  const { t } = useTranslation();
  const labelKey = item?.label ? `${item.label}${labelKeySuffix ?? ""}` : undefined;
  const [localValue, setLocalValue] = useState(filterValue ?? "");
  const debouncedValue = useDebounce(localValue, debounceMs);
  const lastCommittedRef = useRef<string | null>(filterValue || null);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    setLocalValue(filterValue ?? "");
    lastCommittedRef.current = filterValue || null;
  }, [filterValue]);

  useEffect(() => {
    const value = debouncedValue || null;
    if (value === lastCommittedRef.current) return;

    // For date inputs, validate the date before updating
    if (type === "date" && value) {
      const date = new Date(value);
      if (isNaN(date.getTime()) || date.getFullYear() <= 1800) return; // Skip update for invalid dates or year <= 1800
    }

    lastCommittedRef.current = value;
    onUpdateRef.current(value);
  }, [debouncedValue, type]);

  return (
    <TextField
      label={labelKey && t(labelKey)}
      placeholder={item?.placeholder && t(item.placeholder)}
      data-cy={`${item?.value}-formInput`}
      type={type}
      slotProps={type === "date" ? { inputLabel: { shrink: true }, htmlInput: { max: "9999-01-01" } } : undefined}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => {
        const value = localValue || null;
        if (value === lastCommittedRef.current) return;
        lastCommittedRef.current = value;
        onUpdateRef.current(value);
      }}
    />
  );
};
