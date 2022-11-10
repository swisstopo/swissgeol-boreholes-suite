import React, { useCallback, useEffect, useState } from "react";
import * as Styled from "./styles";
import Instrument from "./components/instrument";
import { Button } from "semantic-ui-react";
import TranslationText from "../../../translationText";
import { profileKind } from "../../constance";
import {
  createNewInstrument,
  createNewLayer,
  createNewStratigraphy,
  deletingLayer,
  getData,
  getProfile,
} from "./api";
import useCasingList from "../../hooks/useCasingList";

const ProfileInstrument = props => {
  const {
    isEditable,
    borehole,
    reloadLayer,
    onUpdated,
    selectedStratigraphyID,
    setHasInstrumentWithoutCasing,
  } = props;

  const { casing } = useCasingList(borehole.data.id);
  const [instruments, setInstruments] = useState([]);
  const [instrumentProfileId, setInstrumentProfileId] = useState(null);
  const [reload, setReload] = useState(0);

  const createStratigraphy = useCallback(boreholeID => {
    createNewStratigraphy(boreholeID, profileKind.INSTRUMENT).then(id => {
      setInstrumentProfileId(id);
    });
  }, []);

  const getInstrumentProfile = useCallback(() => {
    getProfile(borehole.data.id, profileKind.INSTRUMENT).then(response => {
      if (response.length > 0) {
        setInstrumentProfileId(response[0].id);
      } else if (response.length === 0) {
        createStratigraphy(borehole.data.id);
      }
    });
  }, [borehole, createStratigraphy]);

  useEffect(() => {
    getInstrumentProfile();
  }, [getInstrumentProfile]);

  const setData = useCallback(instrumentID => {
    getData(instrumentID).then(response => {
      setInstruments(response);
    });
  }, []);

  useEffect(() => {
    setHasInstrumentWithoutCasing(
      instruments.some(i => i.instrument_casing_id === 0),
    );
  }, [instruments, setHasInstrumentWithoutCasing]);

  useEffect(() => {
    if (instrumentProfileId) {
      setData(instrumentProfileId);
    }
  }, [instrumentProfileId, reloadLayer, setData, reload]);

  const createLayer = () => {
    if (instrumentProfileId) {
      if (selectedStratigraphyID) {
        createNewInstrument(instrumentProfileId, selectedStratigraphyID).then(
          response => {
            if (response) onUpdated("newLayer");
          },
        );
      } else {
        createNewLayer(instrumentProfileId).then(response => {
          if (response) onUpdated("newLayer");
        });
      }
    }
  };

  const deleteLayer = id => {
    deletingLayer(id).then(response => {
      if (response) onUpdated("deleteLayer");
    });
  };

  const filterInstrumentsByProfile = () => {
    let instrumentsByProfile = instruments;
    if (selectedStratigraphyID >= 0) {
      instrumentsByProfile = instruments.filter(
        e => e.instrument_casing_id === selectedStratigraphyID,
      );
    }
    return instrumentsByProfile;
  };
  return (
    <Styled.Container>
      {isEditable && (
        <Styled.ButtonContainer>
          <Button
            data-cy="add-instrumentation-button"
            content={<TranslationText id="addInstrument" />}
            icon="add"
            onClick={createLayer}
            secondary
            size="tiny"
          />
        </Styled.ButtonContainer>
      )}

      {filterInstrumentsByProfile().length === 0 && (
        <Styled.Empty data-cy="instrument-message">
          <TranslationText
            id={borehole.data.lock ? "msgAddInstrument" : "msgInstrumentsEmpty"}
          />
        </Styled.Empty>
      )}

      {filterInstrumentsByProfile().length > 0 && (
        <Styled.ListContainer data-cy="instrument-list">
          {filterInstrumentsByProfile().map((item, index) => (
            <Instrument
              data={{
                info: item,
                index,
                deleting: deleteLayer,
                onUpdated,
                isEditable,
                instruments,
                setInstruments,
                update: () => {
                  setReload(prevState => prevState + 1);
                },
                casing,
              }}
              key={index}
            />
          ))}
        </Styled.ListContainer>
      )}
    </Styled.Container>
  );
};

export default ProfileInstrument;
