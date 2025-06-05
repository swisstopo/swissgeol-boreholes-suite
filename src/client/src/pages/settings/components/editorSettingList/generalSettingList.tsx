import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Checkbox } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { Codelist, useCodelists } from "../../../../components/codelist.ts";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import { SettingsItem } from "../../data/SettingsItem.ts";

interface GeneralSettingListProps {
  data: { [key: string]: string };
  toggleFilter: (field: string, value: boolean) => void;
  settingsItems: SettingsItem[];
  toggleField: (field: string, value: boolean) => void;
  listName: string;
  toggleFieldArray: (fields: string[], value: boolean) => void;
  toggleFilterArray: (fields: string[], value: boolean) => void;
}

const GeneralSettingList: FC<GeneralSettingListProps> = ({
  data,
  toggleFilter,
  settingsItems,
  toggleField,
  listName,
  toggleFieldArray,
  toggleFilterArray,
}) => {
  const { t } = useTranslation();
  const [checkedStates, setCheckedStates] = useState<{ [key: string]: boolean }>({});
  const { data: domains } = useCodelists();

  useEffect(() => {
    const isChecked = (item: SettingsItem) => {
      const isVisible = (field: string) => {
        const layerKindConfigEntry = domains?.find((c: Codelist) => c.schema === "layer_kind");
        const conf = layerKindConfigEntry?.conf ? JSON.parse(layerKindConfigEntry?.conf) : "";
        return conf?.fields?.[field] ?? false;
      };
      const getNestedValue = (settingValue: string) => {
        const splitStrings = settingValue.split(".");
        // @ts-expect-error setting values inside efilter have not been typed
        return splitStrings.length > 1 ? data?.[splitStrings[0]]?.[splitStrings[1]] : data?.[settingValue];
      };
      return listName === "lithologyfields" ? isVisible(item.value) : getNestedValue(item.value);
    };

    const initialState: { [key: string]: boolean } = {};
    settingsItems.forEach(item => {
      initialState[item.value] = isChecked(item);
    });
    setCheckedStates(initialState);
  }, [data, domains, listName, settingsItems]);

  const sendSelectAll = useCallback(
    (shouldSelectAll: boolean) => {
      const newData: string[] = [];
      settingsItems.forEach(element => {
        newData.push(element.value);
      });

      if (listName === "lithologyfields") {
        toggleFieldArray(newData, shouldSelectAll);
      } else toggleFilterArray(newData, shouldSelectAll);

      setCheckedStates(prevState => {
        const newState: { [key: string]: boolean } = { ...prevState };
        settingsItems.forEach(item => {
          newState[item.value] = shouldSelectAll;
        });
        return newState;
      });
    },
    [listName, settingsItems, toggleFieldArray, toggleFilterArray],
  );

  const handleCheckboxChange = useCallback(
    (item: SettingsItem, checked: boolean) => {
      setCheckedStates(prevState => ({
        ...prevState,
        [item.value]: checked,
      }));

      if (listName === "lithologyfields") {
        toggleField(item.value, checked);
      } else {
        toggleFilter(item.value, checked);
      }
    },
    [listName, toggleField, toggleFilter],
  );

  return (
    <Box pt={2}>
      <Box sx={{ py: 1, borderBottom: `1px solid ${theme.palette.border.light}` }}>
        <Button
          variant="outlined"
          sx={{ mr: 1 }}
          onClick={() => {
            sendSelectAll(true);
          }}>
          {t("selectAll")}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            sendSelectAll(false);
          }}>
          {t("unselectAll")}
        </Button>
      </Box>
      {settingsItems?.map(item => {
        return (
          <Box key={item.id} sx={{ py: 1, borderBottom: `1px solid ${theme.palette.border.light}` }}>
            <Checkbox
              checked={!!checkedStates[item.value]}
              onChange={e => handleCheckboxChange(item, e.target.checked)}
              data-cy={`checkbox-${item.value}`}
            />
            <TranslationText id={item.label} />
          </Box>
        );
      })}
    </Box>
  );
};

export default GeneralSettingList;
