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
  const [reload, setReload] = useState(0);
  const [state, setState] = useState({
    isFetching: false,
    isPatching: false,
    instrumentID: null,
    allfields: false,
  });

  const createStratigraphy = useCallback(boreholeID => {
    createNewStratigraphy(boreholeID, profileKind.INSTRUMENT).then(id => {
      setState(prevState => ({
        ...prevState,
        instrumentID: id,
      }));
    });
  }, []);

  const getInstrumentProfile = useCallback(() => {
    getProfile(borehole.data.id, profileKind.INSTRUMENT).then(response => {
      if (response.length > 0) {
        setState(prevState => ({
          ...prevState,
          instrumentID: response[0].id,
        }));
      } else if (response.length === 0) {
        createStratigraphy(borehole.data.id);
      }
    });
  }, [borehole, createStratigraphy]);

  useEffect(() => {
    getInstrumentProfile();
  }, [getInstrumentProfile]);

  const setData = useCallback(
    instrumentID => {
      getData(instrumentID).then(response => {
        setInstruments(response);
        setHasInstrumentWithoutCasing(
          response.some(i => i.instrument_casing_id === 0),
        );
      });
    },
    [setHasInstrumentWithoutCasing],
  );

  useEffect(() => {
    if (state.instrumentID) {
      setData(state.instrumentID);
    }
  }, [state.instrumentID, reloadLayer, setData, reload]);

  const createLayer = () => {
    if (state.instrumentID) {
      if (selectedStratigraphyID) {
        createNewInstrument(state.instrumentID, selectedStratigraphyID).then(
          response => {
            if (response) onUpdated("newLayer");
          },
        );
      } else {
        createNewLayer(state.instrumentID).then(response => {
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

  const selectedInstrument = () => {
    let instrument = instruments;
    if (selectedStratigraphyID >= 0) {
      instrument = instruments.filter(
        e => e.instrument_casing_id === selectedStratigraphyID,
      );
    }
    return instrument;
  };
  return (
    <Styled.Container>
      <Styled.ButtonContainer>
        <Button
          data-cy="add-instrument-button"
          content={<TranslationText id="addInstrument" />}
          disabled={!isEditable}
          icon="add"
          onClick={createLayer}
          secondary
          size="tiny"
        />
      </Styled.ButtonContainer>

      {selectedInstrument().length === 0 && (
        <Styled.Empty data-cy="instrument-message">
          <TranslationText
            id={borehole.data.lock ? "msgAddInstrument" : "msgInstrumentsEmpty"}
          />
        </Styled.Empty>
      )}

      {selectedInstrument().length > 0 && (
        <Styled.ListContainer data-cy="instrument-list">
          {selectedInstrument().map((item, index) => (
            <Instrument
              data={{
                info: item,
                index,
                deleting: deleteLayer,
                onUpdated,
                isEditable,
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
