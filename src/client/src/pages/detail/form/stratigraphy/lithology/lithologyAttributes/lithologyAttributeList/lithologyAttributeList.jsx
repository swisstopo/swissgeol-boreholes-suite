import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { Form, Input, TextArea } from "semantic-ui-react";
import _ from "lodash";
import { parseIfString } from "../../../../../../../components/form/formUtils.ts";
import DateField from "../../../../../../../components/legacyComponents/dateField.jsx";
import DomainDropdown from "../../../../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import DomainTree from "../../../../../../../components/legacyComponents/domain/tree/domainTree.jsx";
import TranslationText from "../../../../../../../components/legacyComponents/translationText.jsx";
import * as Styled from "./styles.js";

const LithologyAttributeList = props => {
  const { attribute, showAll, updateChange, layer, isVisibleFunction, isEditable } = props.data;
  const { t } = useTranslation();
  const [inputDisplayValues, setInputDisplayValues] = useState({});

  // This adds a delay to each keystroke before calling the updateChange method in the parent component.
  // It prevents the API from being called too often.
  const debouncedUpdateChange = useMemo(
    () =>
      _.debounce((value, newValue, to, isNumber) => {
        updateChange(value, newValue, to, isNumber);
      }, 2000),
    [updateChange],
  );

  const updateInputDisplayValue = useCallback(
    (value, inputValue) => {
      setInputDisplayValues(prevInputDisplayValues => ({
        ...prevInputDisplayValues,
        [value]: inputValue,
      }));
    },
    [setInputDisplayValues],
  );

  return (
    <Styled.Container data-cy="profile-attribute-list">
      {attribute.map((item, key) => (
        <Form autoComplete="false" error key={key}>
          <Styled.AttributesContainer required={item.require}>
            {(item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Styled.Label>
                <TranslationText id={item.label} />
              </Styled.Label>
            )}
            {item.type === "Input" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Styled.AttributesItem>
                {item.isNumber ? (
                  <NumericFormat
                    data-cy={item.value}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={e => {
                      updateInputDisplayValue(item.value, e.target.value);
                      debouncedUpdateChange(
                        item.value,
                        e.target.value === "" ? null : parseIfString(e.target.value),
                        item?.to,
                        item?.isNumber,
                      );
                    }}
                    readOnly={!isEditable}
                    spellCheck="false"
                    style={{ width: "100%" }}
                    value={
                      _.isNil(inputDisplayValues[item.value])
                        ? _.isNil(layer?.[item.value])
                          ? ""
                          : layer[item.value]
                        : inputDisplayValues[item.value]
                    }
                    thousandSeparator="'"
                  />
                ) : (
                  <Input
                    data-cy={item.value}
                    autoCapitalize="off"
                    autoComplete="off"
                    readOnly={!isEditable}
                    autoCorrect="off"
                    onChange={e => {
                      updateInputDisplayValue(item.value, e.target.value);
                      debouncedUpdateChange(
                        item.value,
                        e.target.value === "" ? null : e.target.value,
                        item?.to,
                        item?.isNumber,
                      );
                    }}
                    spellCheck="false"
                    style={{ width: "100%" }}
                    value={
                      _.isNil(inputDisplayValues[item.value])
                        ? _.isNil(layer?.[item.value])
                          ? ""
                          : layer[item.value]
                        : inputDisplayValues[item.value]
                    }
                  />
                )}
              </Styled.AttributesItem>
            )}

            {item.type === "TextArea" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Styled.AttributesItem>
                <TextArea
                  data-cy={item.value}
                  onChange={e => {
                    updateInputDisplayValue(item.value, e.target.value);
                    debouncedUpdateChange(item.value, e.target.value);
                  }}
                  style={{ width: "100%" }}
                  readOnly={!isEditable}
                  value={
                    _.isNil(inputDisplayValues[item.value])
                      ? _.isNil(layer?.[item.value])
                        ? ""
                        : layer[item.value]
                      : inputDisplayValues[item.value]
                  }
                />
              </Styled.AttributesItem>
            )}

            {item.type === "Radio" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Form.Group style={{ display: "flex", paddingTop: "5px" }}>
                <Form.Radio
                  checked={_.isNil(layer?.[item.value]) ? false : layer[item.value]}
                  label={t("yes")}
                  onChange={() => updateChange(item.value, true, item?.to)}
                  style={{ paddingRight: "20px" }}
                />
                <Form.Radio
                  checked={_.isNil(layer?.[item.value]) ? false : !layer[item.value]}
                  label={t("no")}
                  onChange={() => updateChange(item.value, false, item?.to)}
                />
                <Form.Radio
                  checked={_.isNil(layer?.[item.value])}
                  label={t("np")}
                  onChange={() => updateChange(item.value, null, item?.to)}
                />
              </Form.Group>
            )}

            {item.type === "Dropdown" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Styled.AttributesItem>
                <DomainDropdown
                  data-cy={item.value}
                  multiple={item.multiple}
                  onSelected={e => {
                    return updateChange(
                      item.value,
                      item.multiple && e.length > 0 ? e.map(mlpr => mlpr.id) : e.id,
                      false,
                    );
                  }}
                  readOnly={!isEditable}
                  schema={item.schema}
                  search={item.search}
                  selected={_.isNil(layer?.[item.value]) ? null : layer[item.value]}
                />
              </Styled.AttributesItem>
            )}

            {item.type === "DomainTree" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Styled.AttributesItem>
                <DomainTree
                  data-cy={item.value}
                  levels={item.levels}
                  onSelected={e => updateChange(item.value, e.id, false)}
                  schema={item.schema}
                  selected={_.isNil(layer?.[item.value]) ? null : layer[item.value]}
                  title={<TranslationText id={item.label} />}
                  isEditable={isEditable}
                />
              </Styled.AttributesItem>
            )}

            {item.type === "Date" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <Styled.AttributesItem>
                <DateField
                  data-cy={item.value}
                  date={layer?.[item.value] ? layer[item.value] : null}
                  onChange={selected => {
                    updateChange(item.value, selected, false);
                  }}
                />
              </Styled.AttributesItem>
            )}
          </Styled.AttributesContainer>
        </Form>
      ))}
    </Styled.Container>
  );
};

export default LithologyAttributeList;
