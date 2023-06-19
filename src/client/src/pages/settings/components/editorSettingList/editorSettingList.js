import React from "react";
import * as Styled from "./styles";
import { Button, Segment } from "semantic-ui-react";
import TranslationText from "../../../../commons/form/translationText";
import _ from "lodash";

const EditorSettingList = props => {
  const {
    data,
    toggleFilter,
    attribute,
    toggleField,
    listName,
    geocode,
    codes,
    toggleFieldArray,
    toggleFilterArray,
    type,
  } = props;

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

        if (element.code === geocode) {
          if (
            type === "editor" &&
            _.isObject(element.conf) &&
            _.has(element.conf, `fields.${field}`)
          ) {
            return element.conf.fields[field];
          }
          if (
            type === "viewer" &&
            _.isObject(element.conf) &&
            _.has(element.conf, `viewerFields.${field}`)
          ) {
            return element.conf.viewerFields[field];
          } else {
            return false;
          }
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
        <Button.Group size="mini">
          <Button
            onClick={() => {
              sendSelectAll(true);
            }}>
            <TranslationText id="selectAll" />
          </Button>
          <Button
            onClick={() => {
              sendSelectAll(false);
            }}>
            <TranslationText id="unselectAll" />
          </Button>
        </Button.Group>
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
