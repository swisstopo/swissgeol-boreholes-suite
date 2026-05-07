import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { SearchData } from "./filterData/filterInterfaces.ts";
import { FilterMultiSelect, FilterMultiSelectOption } from "./FilterMultiSelect.tsx";

const buttonThreshold = 7;

interface FilterAdaptiveSelectProps<K extends number | string> {
  item: SearchData;
  options: FilterMultiSelectOption<K>[];
  filterValue: K[] | undefined;
  onUpdate: (value: K[] | undefined) => void;
  counts?: Record<string | number, number>;
}

export const FilterAdaptiveSelect = <T extends number | string>({
  item,
  options,
  filterValue,
  onUpdate,
  counts,
}: FilterAdaptiveSelectProps<T>) => {
  const { t } = useTranslation();

  if (options.length > buttonThreshold) {
    return (
      <FilterMultiSelect<T>
        item={item}
        filterValue={filterValue}
        onUpdate={onUpdate}
        options={options}
        counts={counts}
      />
    );
  }

  const selected = filterValue ?? [];
  const toggle = (key: T) => {
    const next = selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key];
    onUpdate(next.length === 0 ? undefined : next);
  };

  return (
    <Box data-cy={`${item.key}-formSelect`}>
      {item.label ? (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {t(item.label)}
        </Typography>
      ) : null}
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {options.map(opt => {
          const isSelected = selected.includes(opt.key);
          const count = counts?.[opt.key] ?? 0;
          const hasCount = counts !== undefined;
          const disabled = hasCount && !isSelected && count < 1;
          const label = hasCount ? `${opt.label} (${count})` : opt.label;
          return (
            <Button
              key={String(opt.key)}
              size="small"
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => toggle(opt.key)}
              disabled={disabled}
              sx={{ textTransform: "none" }}
              data-cy={`${item.key}-button-${opt.key}`}>
              {label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};
