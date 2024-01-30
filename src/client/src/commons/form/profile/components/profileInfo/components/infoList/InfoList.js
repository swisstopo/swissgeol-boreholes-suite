import React from "react";
import * as Styled from "./styles";
import { Input, Form } from "semantic-ui-react";
import TranslationText from "../../../../../translationText";
import DomainDropdown from "../../../../../domain/dropdown/domainDropdown";
import DateField from "../../../../../dateField";
import _ from "lodash";
import { useCallback, useMemo, useState } from "react";

const InfoList = props => {
  const { attribute, profileInfo, updateChange } = props.data;

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
    <>
      <Styled.FormContainer>
        {attribute?.map((item, key) => (
          <Form autoComplete="false" error key={key} size="small">
            <Styled.AttributesContainer required={item.require}>
              <Styled.Label>
                <TranslationText id={item.label} />
              </Styled.Label>

              {item.type === "Input" && (
                <Styled.AttributesItem>
                  <Input
                    data-cy={item.value}
                    autoCapitalize="off"
                    autoComplete="off"
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
                        ? _.isNil(profileInfo?.[item.value])
                          ? ""
                          : profileInfo[item.value]
                        : inputDisplayValues[item.value]
                    }
                  />
                </Styled.AttributesItem>
              )}
              {item.type === "Dropdown" && (
                <Styled.AttributesItem>
                  <DomainDropdown
                    data-cy={item.value}
                    multiple={item.multiple}
                    onSelected={e =>
                      updateChange(
                        item.value,
                        item.multiple ? e.map(mlpr => mlpr.id) : e.id,
                        false,
                      )
                    }
                    schema={item.schema}
                    search={item.search}
                    selected={
                      _.isNil(profileInfo?.[item.value])
                        ? null
                        : profileInfo[item.value]
                    }
                  />
                </Styled.AttributesItem>
              )}

              {item.type === "Date" && (
                <Styled.AttributesItem>
                  <DateField
                    data-cy={item.value}
                    date={
                      profileInfo?.[item.value] ? profileInfo[item.value] : null
                    }
                    onChange={selected => {
                      updateChange(item.value, selected, false);
                    }}
                  />
                </Styled.AttributesItem>
              )}
            </Styled.AttributesContainer>
          </Form>
        ))}
      </Styled.FormContainer>
    </>
  );
};

export default InfoList;
