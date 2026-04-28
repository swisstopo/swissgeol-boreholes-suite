import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { CodelistLabelStyle, useCodelistLabel, useCodelists } from "../../../../components/codelist.ts";
import { SearchData } from "./filterData/filterInterfaces.ts";
import { FilterMultiSelect } from "./FilterMultiSelect.tsx";

interface FilterDomainSelectProps {
  item: SearchData;
  filterValue: number[] | undefined;
  onUpdate: (value: number[] | undefined) => void;
  counts?: Record<number, number>;
}

const buttonThreshold = 10; // number of options above which we switch to a multi-select component instead of buttons

export const FilterDomainSelect: FC<FilterDomainSelectProps> = ({ item, filterValue, onUpdate, counts }) => {
  const { t } = useTranslation();
  const { data: codelists } = useCodelists();
  const getLabel = useCodelistLabel(CodelistLabelStyle.TextOnly);

  const options = useMemo(() => {
    if (!item.schema) return null;
    const domain = codelists
      .filter(c => c.schema === item.schema)
      .sort((a, b) => a.order - b.order)
      .map(c => ({ key: c.id, label: getLabel(c) }));
    const extra = (item.additionalValues ?? []).map(v => ({ key: v.key, label: v.name }));
    return [...domain, ...extra];
  }, [codelists, item.schema, item.additionalValues, getLabel]);

  if (!options) return null;

  if (options.length >= buttonThreshold) {
    return (
      <FilterMultiSelect item={item} filterValue={filterValue} onUpdate={onUpdate} options={options} counts={counts} />
    );
  }

  const selected = filterValue ?? [];
  const toggle = (key: number) => {
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
          // Disable when count information is available and there would be zero matches,
          // unless the option is already selected (so the user can always clear).
          const disabled = hasCount && !isSelected && count < 1;
          const label = hasCount ? `${opt.label} (${count})` : opt.label;
          return (
            <Button
              key={opt.key}
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
