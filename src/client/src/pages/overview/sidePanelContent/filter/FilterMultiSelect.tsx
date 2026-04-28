import { FC, SyntheticEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, Box, Chip, TextField, Typography } from "@mui/material";
import { SearchData } from "./filterData/filterInterfaces.ts";

interface FilterMultiSelectOption {
  key: number;
  label: string;
}

interface FilterMultiSelectProps {
  item: SearchData;
  filterValue: number[] | undefined;
  onUpdate: (value: number[] | undefined) => void;
  options: FilterMultiSelectOption[];
  counts?: Record<number, number>;
}

export const FilterMultiSelect: FC<FilterMultiSelectProps> = ({ item, filterValue, onUpdate, options, counts }) => {
  const { t } = useTranslation();
  const hasCounts = counts !== undefined;

  const selectedOptions = useMemo(
    () => (filterValue ?? []).map(id => options.find(o => o.key === id) ?? { key: id, label: String(id) }),
    [filterValue, options],
  );

  const handleChange = (_: SyntheticEvent, newValues: FilterMultiSelectOption[]) => {
    const ids = newValues.map(v => v.key);
    onUpdate(ids.length === 0 ? undefined : ids);
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
        disableCloseOnSelect
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.key === value.key}
        getOptionLabel={option => option.label}
        getOptionDisabled={option => {
          if (!hasCounts) return false;
          if (filterValue?.includes(option.key)) return false;
          const count = counts?.[option.key] ?? 0;
          return count < 1;
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          const count = counts?.[option.key] ?? 0;
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
                sx={{ height: "26px" }}
                label={option.label}
                data-cy={`${item.key}-chip-${option.key}`}
                {...chipProps}
              />
            );
          })
        }
        renderInput={params => (
          <TextField
            {...params}
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
