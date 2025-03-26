import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, MenuItem, TextField } from "@mui/material";
import { useDomainSchema } from "../../../../api/fetchApiV2.js";
import { FormContainer } from "../../../../components/form/form.js";

const HierarchicalDataSearch = ({ schema, labels, selected, onSelected }) => {
  const { i18n, t } = useTranslation();
  const { data: schemaData } = useDomainSchema(schema);

  const [levels, setLevels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const getSelectedOption = useCallback(
    id => {
      if (id !== null) {
        for (let i = 0; i < schemaData.length; i++) {
          let h = schemaData[i];
          if (h.id === id) {
            return h;
          }
        }
      }
      return null;
    },
    [schemaData],
  );

  const handleChange = event => {
    if (Number(event.target.value) < 0) {
      reset(event.target.value * -1);
    } else {
      updateSelection(event.target.value);
    }
  };

  const updateSelection = useCallback(
    id => {
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
    level => {
      if (selectedIds.length >= level) {
        updateSelection(selectedIds[level - 2]);
      }
    },
    [selectedIds, updateSelection],
  );

  useEffect(() => {
    let selectedOption = getSelectedOption(selected);
    setSelectedIds(selectedOption ? selectedOption.path.split(".").map(id => +id) : []);
  }, [getSelectedOption, selected]);

  useEffect(() => {
    if (schemaData) {
      let levels = [];
      labels.forEach((label, index) => {
        let options = [];
        let selected = null;
        if (reset) {
          options.push({
            key: "dom-opt-z",
            value: -(index + 1),
            italic: true,
            text: t("reset"),
          });
        }

        schemaData
          .slice()
          .sort((a, b) => a.order - b.order)
          .forEach(entry => {
            const path = entry.path.split(".").map(id => +id);
            const level = path.length;
            if (level === index + 1) {
              let option = {
                key: "dom-opt-" + entry.id,
                value: entry.id,
                text: entry[i18n.language],
                content: entry[i18n.language],
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
        <Box sx={{ mt: 2 }} key={schema + "_" + level.level} data-cy="hierarchical-data-search">
          <FormContainer>
            <TextField
              select={true}
              label={t(level.label)}
              onChange={handleChange}
              value={level.selected}
              data-cy={`${level.label}-formSelect`}>
              {level.options.map(item => (
                <MenuItem key={item.key} value={item.value}>
                  {item.italic ? <em>{item.text}</em> : item.text}
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
