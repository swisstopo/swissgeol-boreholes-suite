import { useCallback, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Autocomplete, Box, TextField } from "@mui/material";
import { Codelist, useCodelistSchema } from "../../../../components/codelist.ts";
import { FormContainer } from "../../../../components/form/form.ts";
import { FormSelectMenuItem } from "../../../../components/form/formSelect.tsx";
import { HierarchicalDataSearchProps, Level } from "./hierarchicalDataInterfaces.ts";

const HierarchicalDataSearch: React.FC<HierarchicalDataSearchProps> = ({ schema, labels, selected, onSelected }) => {
  const { i18n, t } = useTranslation();
  const { data: schemaData } = useCodelistSchema(schema);
  const { control } = useFormContext();

  const getSelectedOption = useCallback(
    (id: number | null): Codelist | null => {
      if (id !== null && schemaData) {
        for (let i = 0; i < (schemaData?.length ?? 0); i++) {
          const h = schemaData[i];
          if (h.id === id) {
            return h;
          }
        }
      }
      return null;
    },
    [schemaData],
  );

  const generateLevelOptions = (
    schemaData: Codelist[] | undefined,
    labels: string[] | undefined,
    i18nLang: string,
    t: (key: string) => string,
  ): Level[] => {
    if (!schemaData || !labels) return [];
    return labels.map((label, index) => {
      const options: FormSelectMenuItem[] = [
        {
          key: "reset",
          value: -(index + 1),
          italic: true,
          label: t("reset"),
        },
      ];
      schemaData
        .slice()
        .sort((a, b) => a.order - b.order)
        .forEach(entry => {
          const path = entry.path.split(".").map(Number);
          if (path.length === index + 1) {
            options.push({
              key: entry.id,
              value: entry.id,
              label: entry[i18nLang] as string,
            });
          }
        });
      return {
        level: index + 1,
        label,
        options,
      };
    });
  };

  const levels = useMemo(
    () => generateLevelOptions(schemaData, labels, i18n.language, t),
    [schemaData, labels, i18n.language, t],
  );

  const selectedIds: number[] = useMemo(() => {
    const selectedOption = getSelectedOption(selected);
    return selectedOption ? selectedOption.path.split(".").map(Number) : [];
  }, [getSelectedOption, selected]);

  const handleChange = (value: number) => {
    if (value < 0) {
      reset(value * -1);
    } else {
      updateSelection(value);
    }
  };

  const updateSelection = useCallback(
    (id: number | null) => {
      const selection = getSelectedOption(id);
      if (onSelected)
        if (selection) {
          onSelected({ id: selection.id });
        } else {
          onSelected({ id: null });
        }
    },
    [getSelectedOption, onSelected],
  );

  const reset = useCallback(
    (level: number) => {
      updateSelection(selectedIds[level - 2]);
    },
    [selectedIds, updateSelection],
  );

  return levels.map(level => {
    const selectedOption = level.options.find(opt => selectedIds.includes(Number(opt.value)));
    return (
      <Box sx={{ mt: 1 }} key={schema + "_" + level.level} data-cy="hierarchical-data-search">
        <FormContainer>
          <Controller
            name={level.label}
            control={control}
            defaultValue={selectedOption ?? ""}
            render={({ field }) => (
              <Autocomplete
                key={level.label}
                sx={{ flex: "1" }}
                options={level.options}
                getOptionLabel={option => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                value={selectedOption}
                onChange={(_, newValue) => {
                  if (newValue?.label.toLowerCase() === t("reset").toLowerCase()) {
                    field.onChange(null);
                  } else {
                    field.onChange(newValue.value);
                  }
                  handleChange(Number(newValue?.value));
                }}
                renderInput={params => (
                  <TextField {...params} label={t(level.label)} data-cy={`${level.label}-formSelect`} />
                )}
                renderOption={(props, option) => (
                  <li {...props}>{option.italic ? <em>{option.label}</em> : option.label}</li>
                )}
                disableClearable
              />
            )}
          />
        </FormContainer>
      </Box>
    );
  });
};

export default HierarchicalDataSearch;
