import React, { useState, useEffect, useCallback } from "react";
import * as Styled from "./styles";
import { Input, Form, Button } from "semantic-ui-react";
import TranslationText from "../../../../../translationText";
import DomainDropdown from "../../../../../domain/dropdown/domainDropdown";
import { InstrumentAttributes } from "../../data/InstrumentAttributes";
import { useTranslation } from "react-i18next";
import CasingList from "../../../casingList";
import {
  fetchLayerById,
  fetchLayersByProfileId,
  updateLayer,
} from "../../../../../../../api/fetchApiV2";
import { NumericFormat } from "react-number-format";
import { parseIfString } from "../../../../../formUtils";
import produce from "immer";

const Instrument = props => {
  const {
    index,
    info,
    deleting,
    isEditable,
    casing,
    instruments,
    setInstruments,
  } = props.data;

  const { t } = useTranslation();
  const [casingLayers, setCasingLayers] = useState([]);
  const [instrument, setInstrument] = useState([]);

  const fetchCasingLayers = useCallback(instrumentCasingId => {
    if (instrumentCasingId) {
      if (instrumentCasingId === 0) setCasingLayers([]);
      else {
        fetchLayersByProfileId(instrumentCasingId).then(response => {
          if (response?.length > 0) {
            setCasingLayers(response);
          } else {
            setCasingLayers([]);
          }
        });
      }
    } else {
      setCasingLayers([]);
    }
  }, []);

  useEffect(() => {
    // fetch layer
    fetchLayerById(info.id).then(response => {
      setInstrument(response);
      fetchCasingLayers(response.instrumentCasingId);
    });
  }, [fetchCasingLayers, info.id]);

  const updateInstrument = (attribute, value) => {
    if (!isEditable) {
      alert(t("common:errorStartEditing"));
      return;
    }

    let updatedInstrument;
    // reset casing layer if casing changes.
    if (attribute === "instrumentCasingId") {
      updatedInstrument = {
        ...instrument,
        [attribute]: value,
        instrumentCasingLayerId: null,
      };
      fetchCasingLayers(value);
    } else {
      updatedInstrument = {
        ...instrument,
        [attribute]: value,
      };
    }

    setInstrument(updatedInstrument);
    setInstruments(
      produce(instruments, draft => {
        const index = draft.findIndex(d => d.id === updatedInstrument.id);
        if (index >= 0) {
          draft[index].instrument_casing_id =
            updatedInstrument.instrumentCasingId;
        }
      }),
    );
    updateLayer(updatedInstrument);
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
                {item.isNumber ? (
                  <NumericFormat
                    onChange={e => {
                      updateInstrument(
                        item.value,
                        e.target.value === ""
                          ? null
                          : parseIfString(e.target.value),
                      );
                    }}
                    style={{ width: "100%" }}
                    value={instrument?.[item.value] ?? ""}
                    thousandSeparator="'"
                  />
                ) : (
                  <Input
                    type="text"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={e => {
                      updateInstrument(
                        item.value,
                        e.target.value === "" ? null : e.target.value,
                      );
                    }}
                    spellCheck="false"
                    style={{ width: "100%" }}
                    value={instrument?.[item.value] ?? ""}
                  />
                )}
              </Styled.AttributesItem>
            )}
            {item.type === "Dropdown" && (
              <Styled.AttributesItem data-cy={item.label}>
                <DomainDropdown
                  multiple={item.multiple}
                  onSelected={e => updateInstrument(item.value, e.id)}
                  schema={item.schema}
                  search={item.search}
                  selected={instrument?.[item.value] ?? null}
                />
              </Styled.AttributesItem>
            )}

            {item.type === "CasingDropdown" && (
              <Styled.AttributesItem data-cy={item.label}>
                <CasingList
                  data={casing}
                  dropDownValue={instrument?.[item.value] ?? null}
                  handleCasing={updateInstrument}
                  ItemValue={item.value}
                />
              </Styled.AttributesItem>
            )}

            {item.type === "CasingLayerDropdown" && (
              <Styled.AttributesItem data-cy={item.label}>
                <CasingList
                  disabled={casingLayers?.length === 0}
                  data={casingLayers.map(r => {
                    return { key: r.id, value: r.id, text: r.casing };
                  })}
                  dropDownValue={instrument?.[item.value] ?? null}
                  handleCasing={updateInstrument}
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
