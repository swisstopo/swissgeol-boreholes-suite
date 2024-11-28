import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox } from "@mui/material";
import { Segment } from "semantic-ui-react";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import * as Styled from "./styles";

const EditorSettingList = props => {
  const { data, toggleFilter, attribute, toggleField, listName, codes, toggleFieldArray, toggleFilterArray } = props;
  const { t } = useTranslation();
  const [checkedStates, setCheckedStates] = useState({});

  useEffect(() => {
    const isChecked = item => {
      const isVisible = field => {
        const layerKindConfigEntry = codes?.find(c => c.schema === "layer_kind");

        const conf = layerKindConfigEntry?.conf ? JSON.parse(layerKindConfigEntry?.conf) : "";
        return conf?.fields?.[field] ?? false;
      };
      return listName === "lithologyfields"
        ? isVisible(item.value)
        : item.value.split(".").length > 1
          ? data?.[item.value.split(".")[0]]?.[item.value.split(".")[1]]
          : data?.[item.value];
    };

    const initialState = {};
    attribute.forEach(item => {
      initialState[item.value] = isChecked(item);
    });
    setCheckedStates(initialState);
  }, [attribute, codes, data, listName]);

  const sendSelectAll = value => {
    const newData = [];
    attribute.forEach(element => {
      newData.push(element.value);
    });

    if (listName === "lithologyfields") {
      toggleFieldArray(newData, value);
    } else toggleFilterArray(newData, value);

    setCheckedStates(prevState => {
      const newState = { ...prevState };
      attribute.forEach(item => {
        newState[item.value] = value;
      });
      return newState;
    });
  };

  const handleCheckboxChange = (item, value) => {
    setCheckedStates(prevState => ({
      ...prevState,
      [item.value]: value,
    }));

    if (listName === "lithologyfields") {
      toggleField(item.value, value);
    } else {
      toggleFilter(item.value, value);
    }
  };

  return (
    <Styled.Container>
      <Segment>
        <Button
          variant="outlined"
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
      </Segment>
      {attribute?.map((item, index) => (
        <Segment key={index}>
          <Checkbox
            checked={!!checkedStates[item.value]}
            onChange={e => handleCheckboxChange(item, e.target.checked)}
            data-cy={`checkbox-${item.value}`}
          />
          <TranslationText id={item.label} />
        </Segment>
      ))}
    </Styled.Container>
  );
};

export default EditorSettingList;
