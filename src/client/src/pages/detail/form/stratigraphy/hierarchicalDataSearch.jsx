import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDomainSchema } from "../../../../api/fetchApiV2.js";
import { Form, Header } from "semantic-ui-react";
import * as Styled from "../../../overview/sidePanelContent/filter/listFilterStyles.js";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";

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

  const handleChange = (event, data) => {
    if (data.value < 0) {
      reset(data.value * -1);
    } else {
      updateSelection(data.value);
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
            text: "",
            content: (
              <span
                style={{
                  color: "red",
                }}>
                {t("reset")}
              </span>
            ),
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
                content: (
                  <Header
                    content={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                        }}>
                        <div
                          style={{
                            flex: "1 1 100%",
                          }}>
                          {entry[i18n.language]}
                        </div>
                      </div>
                    }
                  />
                ),
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
  }, [i18n.language, labels, reset, schemaData, selectedIds]);

  return (
    <>
      {levels.map(level => (
        <div key={schema + "_" + level.level} data-cy="hierarchical-data-search">
          <Styled.Label>
            <TranslationText id={level.label} />
          </Styled.Label>
          <Styled.AttributesItem>
            <Form.Select fluid search={true} onChange={handleChange} options={level.options} value={level.selected} />
          </Styled.AttributesItem>
        </div>
      ))}
    </>
  );
};

export default HierarchicalDataSearch;
