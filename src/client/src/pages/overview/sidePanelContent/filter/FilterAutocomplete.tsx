import { FC, KeyboardEvent, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, CircularProgress, TextField, Typography } from "@mui/material";
import { useDebounce } from "@uidotdev/usehooks";
import {
  BoreholeSuggestionField,
  FilterRequest,
  isBoreholeSuggestionField,
  useBoreholeSuggestions,
} from "../../../../api/borehole.ts";
import { SearchData } from "./filterData/filterInterfaces";

interface FilterAutocompleteProps {
  item: SearchData;
  filterValue: string | null;
  onUpdate: (value: string | null) => void;
  filterRequest?: FilterRequest;
}

export const FilterAutocomplete: FC<FilterAutocompleteProps> = ({ item, filterValue, onUpdate, filterRequest }) => {
  console.log("Rendering FilterAutocomplete", { item, filterValue });
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>(filterValue ?? "");

  useEffect(() => {
    setInputValue(filterValue ?? "");
  }, [filterValue]);

  const debouncedForFetch = useDebounce(inputValue, 300);

  const isValidField = isBoreholeSuggestionField(item.key);
  const fetchEnabled = debouncedForFetch.trim().length >= 1;
  const field = item.key as BoreholeSuggestionField;
  const { data: suggestions = [], isFetching } = useBoreholeSuggestions(
    field,
    debouncedForFetch,
    isValidField && fetchEnabled,
    filterRequest,
  );

  const options = useMemo(() => suggestions.map(s => s.value), [suggestions]);
  const countByValue = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of suggestions) map.set(s.value, s.count);
    return map;
  }, [suggestions]);

  const handleChange = (_: SyntheticEvent, newValue: string | null = null) => {
    setInputValue(newValue ?? "");
    onUpdate(newValue);
  };

  const handleBlur = () => {
    // Revert any uncommitted typed text to the currently committed filter value,
    // since the filter only commits on Enter or suggestion selection.
    setInputValue(filterValue ?? "");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onUpdate(inputValue || null);
      // @ts-expect-error - blur is unknown on the event target but closes the autocomplete popover as desired
      event.target.blur();
    }
  };

  return (
    <>
      {item.label ? (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {t(item.label)}
        </Typography>
      ) : null}
      <Autocomplete
        freeSolo
        options={options}
        onKeyDown={handleKeyDown}
        value={inputValue || null}
        inputValue={inputValue}
        onInputChange={(_, newInput) => setInputValue(newInput)}
        onChange={handleChange}
        onBlur={handleBlur}
        filterOptions={x => x}
        loading={fetchEnabled && isFetching}
        noOptionsText={t("filterNoSuggestions")}
        renderOption={(props, option, { index }) => {
          const count = countByValue.get(option);
          return (
            <li {...props} data-cy={`${item.key}-suggestion-${index}`} key={`${option}-${index}`}>
              <span style={{ flex: 1 }}>{option}</span>
              <Typography component="span" variant="caption" color="text.secondary">
                {count ?? ""}
              </Typography>
            </li>
          );
        }}
        renderInput={params => (
          <TextField
            {...params}
            sx={{ mt: 0 }}
            placeholder={item.placeholder ? t(item.placeholder) : undefined}
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                "data-cy": `${item.key}-formInput`,
              },
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {fetchEnabled && isFetching ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </>
  );
};
