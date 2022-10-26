import React, { useState, useEffect } from "react";
import * as Styled from "./styles";
import { Input, Form, Button } from "semantic-ui-react";
import TranslationText from "../../../../../translationText";
import DomainDropdown from "../../../../../domain/dropdown/domainDropdown";
import { patchLayer } from "../../../../../../../api-lib/index";
import { InstrumentAttributes } from "../../data/InstrumentAttributes";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import CasingList from "../../../casingList";
import { produce } from "immer";

const Instrument = props => {
  const { index, info, deleting, isEditable, update, casing } = props.data;

  const { t } = useTranslation();
  const [instrument, setInstrument] = useState({
    id: null,
    instrument_kind: null,
    depth_from: null,
    depth_to: null,
    notes: null,
    instrument_status: null,
    instrument_casing_id: null,
    instrument_casing_layer_id: null,
    instrument_id: null,
  });

  const [updateAttributeDelay, setUpdateAttributeDelay] = useState({});

  useEffect(() => {
    setInstrument(info);
  }, [info]);

  const updateChange = (attribute, value, to = true, isNumber = false) => {
    if (!isEditable) {
      alert(t("common:errorStartEditing"));
      return;
    }

    setInstrument(
      produce(draft => {
        draft[attribute] = value;
      }),
    );

    if (isNumber) {
      if (value === null) {
        patch(attribute, value);
      } else if (/^-?\d*[.,]?\d*$/.test(value)) {
        patch(attribute, _.toNumber(value));
      }
    } else {
      patch(attribute, value);
    }
  };

  const patch = (attribute, value) => {
    clearTimeout(updateAttributeDelay?.[attribute]);

    let setDelay = {
      [attribute]: setTimeout(() => {
        patchLayer(info?.id, attribute, value)
          .then(response => {
            if (response.data.success) {
              if (attribute === "instrument_casing_id") {
                update();
              }
            } else {
              alert(response.data.message);
              window.location.reload();
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      }, 500),
    };

    Promise.resolve().then(() => {
      setUpdateAttributeDelay(setDelay);
    });
  };

  return (
    <Styled.FormContainer>
      {InstrumentAttributes.map((item, key) => (
        <Form autoComplete="false" error key={key} size="small">
          <Styled.AttributesContainer required={item.require}>
            {index === 0 && (
              <Styled.Label>
                <TranslationText id={item.label} firstUpperCase />
              </Styled.Label>
            )}

            {item.type === "Input" && (
              <Styled.AttributesItem data-cy={item.label}>
                <Input
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  onChange={e => {
                    updateChange(
                      item.value,
                      e.target.value === "" ? null : e.target.value,
                      item?.to,
                      item?.isNumber,
                    );
                  }}
                  spellCheck="false"
                  style={{ width: "100%" }}
                  value={
                    _.isNil(instrument?.[item.value])
                      ? ""
                      : instrument[item.value]
                  }
                />
              </Styled.AttributesItem>
            )}
            {item.type === "Dropdown" && (
              <Styled.AttributesItem data-cy={item.label}>
                <DomainDropdown
                  multiple={item.multiple}
                  onSelected={e => updateChange(item.value, e.id, false)}
                  schema={item.schema}
                  search={item.search}
                  selected={
                    _.isNil(instrument?.[item.value])
                      ? null
                      : instrument[item.value]
                  }
                />
              </Styled.AttributesItem>
            )}

            {item.type === "CasingDropdown" && (
              <Styled.AttributesItem data-cy={item.label}>
                <CasingList
                  data={casing}
                  dropDownValue={
                    _.isNil(instrument?.[item.value])
                      ? null
                      : instrument[item.value]
                  }
                  handleCasing={updateChange}
                  ItemValue={item.value}
                />
              </Styled.AttributesItem>
            )}

            {item.type === "Button" && (
              <Button
                data-cy="delete-instrument-button"
                disabled={!isEditable}
                icon="close"
                onClick={() => {
                  deleting(info?.id);
                }}
                size="small"
              />
            )}
          </Styled.AttributesContainer>
        </Form>
      ))}
    </Styled.FormContainer>
  );
};

export default Instrument;
