import React from "react";
import * as Styled from "./styles";
import { Input, Form } from "semantic-ui-react";
import TranslationText from "../../../../../translationText";
import DomainDropdown from "../../../../../domain/dropdown/domainDropdown";
import DateField from "../../../../../dateField";
import _ from "lodash";
import CasingList from "../../../casingList";

const InfoList = props => {
  const { attribute, profileInfo, updateChange, casing } = props.data;

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
                    onChange={e =>
                      updateChange(
                        item.value,
                        e.target.value === "" ? null : e.target.value,
                        item?.to,
                        item?.isNumber,
                      )
                    }
                    spellCheck="false"
                    style={{ width: "100%" }}
                    value={
                      _.isNil(profileInfo?.[item.value])
                        ? ""
                        : profileInfo[item.value]
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

              {item.type === "CasingDropdown" && (
                <Styled.AttributesItem>
                  <CasingList
                    data-cy={item.value}
                    data={casing}
                    dropDownValue={
                      _.isNil(profileInfo?.[item.value])
                        ? null
                        : profileInfo?.[item.value]
                    }
                    handleCasing={updateChange}
                    ItemValue={item.value}
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
