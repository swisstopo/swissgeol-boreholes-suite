import { KeyboardEvent, SyntheticEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, Box, Chip, TextField, Typography } from "@mui/material";
import { CircleX } from "lucide-react";
import { SearchData } from "./filterData/filterInterfaces.ts";

export interface FilterMultiSelectOption<K extends number | string = number> {
  key: K;
  label: string;
}

interface FilterMultiSelectProps<K extends number | string> {
  item: SearchData;
  filterValue: K[] | undefined;
  onUpdate: (value: K[] | undefined) => void;
  options: FilterMultiSelectOption<K>[];
  counts?: Record<string | number, number>;
}

export const FilterMultiSelect = <T extends number | string>({
  item,
  filterValue,
  onUpdate,
  options,
  counts,
}: FilterMultiSelectProps<T>) => {
  const { t } = useTranslation();
  const hasCounts = counts !== undefined;

  const selectedOptions = useMemo(
    () => (filterValue ?? []).map(id => options.find(o => o.key === id) ?? { key: id, label: String(id) }),
    [filterValue, options],
  );

  const handleChange = (_: SyntheticEvent, newValues: FilterMultiSelectOption<T>[]) => {
    const ids = newValues.map(v => v.key);
    onUpdate(ids.length === 0 ? undefined : ids);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      // @ts-expect-error - blur is unknown on the event target but closes the autocomplete popover as desired
      event.target.blur();
    }
  };

  return (
    <Box data-cy={`${item.key}-formMultiSelect`}>
      {item.label ? (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {t(item.label)}
        </Typography>
      ) : null}
      <Autocomplete
        multiple
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        isOptionEqualToValue={(option, value) => option.key === value.key}
        getOptionLabel={option => option.label}
        getOptionDisabled={option => {
          if (!hasCounts) return false;
          if (filterValue?.includes(option.key)) return false;
          const count = counts?.[option.key as string | number] ?? 0;
          return count < 1;
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          const count = counts?.[option.key as string | number] ?? 0;
          return (
            <li key={key} {...rest} data-cy={`${item.key}-option-${option.key}`}>
              <span style={{ flex: 1 }}>{option.label}</span>
              {hasCounts ? (
                <Typography component="span" variant="caption" color="text.secondary">
                  ({count})
                </Typography>
              ) : null}
            </li>
          );
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...chipProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                size="small"
                color="primary"
                sx={{ height: "26px" }}
                label={option.label}
                data-cy={`${item.key}-chip-${option.key}`}
                deleteIcon={<CircleX style={{ width: "16px", height: "16px" }} />}
                {...chipProps}
              />
            );
          })
        }
        renderInput={params => (
          <TextField
            {...params}
            sx={{ mt: 0 }}
            placeholder={item.placeholder ? t(item.placeholder) : undefined}
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                "data-cy": `${item.key}-formSelect`,
              },
            }}
          />
        )}
      />
    </Box>
  );
};
