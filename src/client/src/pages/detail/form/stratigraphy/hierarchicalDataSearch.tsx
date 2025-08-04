import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, MenuItem, TextField } from "@mui/material";
import { Codelist, useCodelistSchema } from "../../../../components/codelist.ts";
import { FormContainer } from "../../../../components/form/form.ts";
import { FormSelectMenuItem } from "../../../../components/form/formSelect.tsx";
import { HierarchicalDataSearchProps, Level } from "./hierachicalDataInterfaces.ts";

const HierarchicalDataSearch: React.FC<HierarchicalDataSearchProps> = ({ schema, labels, selected, onSelected }) => {
  const { i18n, t } = useTranslation();
  const { data: schemaData } = useCodelistSchema(schema);

  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value < 0) {
      reset(value * -1);
    } else {
      updateSelection(value);
    }
  };

  const updateSelection = useCallback(
    (id: number | null) => {
      const selection = getSelectedOption(id);
      if (selection === null) {
        if (onSelected !== undefined) {
          onSelected({
            id: null,
          });
        }
      } else {
        if (onSelected !== undefined) {
          onSelected({ ...selection });
        }
      }
    },
    [getSelectedOption, onSelected],
  );

  const reset = useCallback(
    (level: number) => {
      if (selectedIds.length >= level) {
        updateSelection(selectedIds[level - 2]);
      }
    },
    [selectedIds, updateSelection],
  );

  useEffect(() => {
    const selectedOption = getSelectedOption(selected);
    setSelectedIds(selectedOption ? selectedOption.path.split(".").map(id => +id) : []);
  }, [getSelectedOption, selected]);

  useEffect(() => {
    if (schemaData) {
      const levels: Level[] = [];
      labels?.forEach((label, index) => {
        const options: FormSelectMenuItem[] = [];
        let selected: number | null = null;

        options.push({
          key: "dom-opt-z",
          value: -(index + 1),
          italic: true,
          label: t("reset"),
        });

        schemaData
          .slice()
          .sort((a: Codelist, b: Codelist) => a.order - b.order)
          .forEach((entry: Codelist) => {
            const path = entry.path.split(".").map((id: string) => +id);
            const level = path.length;
            if (level === index + 1) {
              const option: FormSelectMenuItem = {
                key: "dom-opt-" + entry.id,
                value: entry.id,
                label: entry[i18n.language] as string,
              };
              if (selectedIds.includes(entry.id)) {
                selected = entry.id;
              }
              options.push(option);
            }
          });
        levels.push({
          level: index + 1,
          label: label,
          options: options,
          selected: selected,
        });
      });
      setLevels(levels);
    }
  }, [i18n.language, labels, reset, schemaData, selectedIds, t]);

  return (
    <>
      {levels.map(level => (
        <Box sx={{ mt: 1 }} key={schema + "_" + level.level} data-cy="hierarchical-data-search">
          <FormContainer>
            <TextField
              select={true}
              label={t(level.label)}
              onChange={handleChange}
              value={level.selected ?? ""}
              data-cy={`${level.label}-formSelect`}>
              {level.options.map(item => (
                <MenuItem key={item.key} value={item.value as number}>
                  {item.italic ? <em>{item.label}</em> : item.label}
                </MenuItem>
              ))}
            </TextField>
          </FormContainer>
        </Box>
      ))}
    </>
  );
};

export default HierarchicalDataSearch;
