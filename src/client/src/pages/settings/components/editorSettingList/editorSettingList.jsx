import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { Segment } from "semantic-ui-react";
import _ from "lodash";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import * as Styled from "./styles";

const EditorSettingList = props => {
  const { data, toggleFilter, attribute, toggleField, listName, codes, toggleFieldArray, toggleFilterArray } = props;

  const { t } = useTranslation();

  const isChecked = item => {
    return listName === "lithologyfields"
      ? isVisible(item.value)
      : item.value.split(".").length > 1
        ? data?.[item.value.split(".")[0]]?.[item.value.split(".")[1]]
        : data?.[item.value];
  };
  const isVisible = field => {
    if (_.has(codes, "data.layer_kind") && _.isArray(codes.data.layer_kind)) {
      for (let idx = 0; idx < codes.data.layer_kind.length; idx++) {
        const element = codes.data.layer_kind[idx];

        if (element.code === "Geol") {
          return element.conf.fields[field];
        }
      }
    }
    return false;
  };

  const sendSelectAll = value => {
    const newData = [];
    attribute.forEach(element => {
      newData.push(element.value);
    });

    if (listName === "lithologyfields") {
      toggleFieldArray(newData, value);
    } else toggleFilterArray(newData, value);
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
          <Styled.CheckboxContainer
            checked={isChecked(item)}
            onChange={(e, d) => {
              if (listName === "lithologyfields") {
                toggleField(item.value, d.checked);
              } else {
                toggleFilter(item.value, d.checked);
              }
            }}
          />
          <TranslationText id={item.label} />
        </Segment>
      ))}
    </Styled.Container>
  );
};

export default EditorSettingList;
