import React, { useState, useEffect, useCallback } from "react";
import * as Styled from "./styles";
import { Input, Form, Button } from "semantic-ui-react";
import TranslationText from "../../../../../translationText";
import DomainDropdown from "../../../../../domain/dropdown/domainDropdown";
import { patchLayer } from "../../../../../../../api-lib/index";
import { InstrumentAttributes } from "../../data/InstrumentAttributes";
import { useTranslation } from "react-i18next";
import CasingList from "../../../casingList";
import { produce } from "immer";
import { fetchApiV2 } from "../../../../../../../api/fetchApiV2";

const Instrument = props => {
  const { index, info, deleting, isEditable, update, casing } = props.data;

  const { t } = useTranslation();
  const [instrumentInfo, setInstrumentInfo] = useState({
    id: null,
    instrument_kind: null,
    depth_from: null,
    depth_to: null,
    notes: null,
    instrument_status: null,
    instrument_casing_id: null,
    instrument_id: null,
  });
  const [casingLayers, setCasingLayers] = useState([]);
  const [instrument, setInstrument] = useState([]);
  const [updateAttributeDelay, setUpdateAttributeDelay] = useState({});

  async function fetchLayersByProfileId(profileId) {
    return await fetchApiV2(`layer/profileId/${profileId}`, "GET");
  }

  async function fetchLayerById(id) {
    return await fetchApiV2(`layer/${id}`, "GET");
  }

  async function updateLayer(layer) {
    // remove derived objects
    delete layer.createdBy;
    delete layer.updatedBy;
    return await fetchApiV2(`layer`, "PUT", layer);
  }

  const fetchCasingLayers = useCallback(() => {
    if (instrument.instrumentCasingId) {
      fetchLayersByProfileId(instrument.instrumentCasingId).then(response => {
        if (response?.length > 0) {
          setCasingLayers(response);
        } else {
          setCasingLayers([]);
        }
      });
    } else {
      setCasingLayers([]);
    }
  }, [instrument.instrumentCasingId]);

  useEffect(() => {
    setInstrumentInfo(info);

    // fetch layer
    fetchLayerById(info.id).then(response => {
      setInstrument(response);
    });

    fetchCasingLayers();
  }, [fetchCasingLayers, info]);

  const updateChange = (attribute, value, isNumber = false) => {
    if (!isEditable) {
      alert(t("common:errorStartEditing"));
      return;
    }

    // refresh casing layers if casing changes
    if (attribute === "instrument_casing_id") {
      setCasingLayers([]);
      updateLayer({ ...instrument, instrumentCasingLayerId: null });
      instrument.instrumentCasingId && fetchCasingLayers();
    }

    setInstrumentInfo(
      produce(draft => {
        draft[attribute] = value;
      }),
    );

    if (isNumber) {
      if (value === null) {
        patch(attribute, value);
      } else if (/^-?\d*[.,]?\d*$/.test(value)) {
        patch(attribute, parseInt(value));
      }
    } else {
      patch(attribute, value);
    }
  };

  const updateInstrument = (attribute, value) => {
    if (!isEditable) {
      alert(t("common:errorStartEditing"));
      return;
    }

    setInstrument({ ...instrument, [attribute]: value });
    updateLayer({ ...instrument, [attribute]: value });
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
                      item?.isNumber,
                    );
                  }}
                  spellCheck="false"
                  style={{ width: "100%" }}
                  value={instrumentInfo?.[item.value] ?? ""}
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
                  selected={instrumentInfo?.[item.value] ?? null}
                />
              </Styled.AttributesItem>
            )}

            {item.type === "CasingDropdown" && (
              <Styled.AttributesItem data-cy={item.label}>
                <CasingList
                  data={casing}
                  dropDownValue={instrumentInfo?.[item.value] ?? null}
                  handleCasing={updateChange}
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
