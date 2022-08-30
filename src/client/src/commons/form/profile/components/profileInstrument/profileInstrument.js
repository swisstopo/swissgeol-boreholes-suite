import React, { useCallback, useEffect, useState } from 'react';
import * as Styled from './styles';
import Instrument from './components/instrument';
import { Button } from 'semantic-ui-react';
import TranslationText from '../../../translationText';
import { profileKind } from '../../constance';
import {
  createNewInstrument,
  createNewLayer,
  createNewStratigraphy,
  deletingLayer,
  getData,
  getProfile,
} from './api';
import useCasingList from '../../hooks/useCasingList';

const ProfileInstrument = props => {
  const {
    isEditable,
    boreholeID,
    reloadLayer,
    onUpdated,
    selectedStratigraphyID,
  } = props.data;

  const { casing } = useCasingList(boreholeID);
  const [instruments, setInstruments] = useState([]);
  const [hasCasing, setHasCasing] = useState(false);
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

  const checkHasCasing = useCallback(() => {
    getProfile(boreholeID, profileKind.CASING).then(response => {
      if (response.length > 0) {
        setHasCasing(true);
      } else {
        setHasCasing(false);
      }
    });
  }, [boreholeID]);

  const getInstrumentProfile = useCallback(() => {
    getProfile(boreholeID, profileKind.INSTRUMENT).then(response => {
      checkHasCasing();
      if (response.length > 0) {
        setState(prevState => ({
          ...prevState,
          instrumentID: response[0].id,
        }));
      } else if (response.length === 0) {
        createStratigraphy(boreholeID);
      }
    });
  }, [boreholeID, createStratigraphy, checkHasCasing]);

  useEffect(() => {
    getInstrumentProfile();
  }, [getInstrumentProfile]);

  const setData = useCallback(instrumentID => {
    getData(instrumentID).then(response => {
      setInstruments(response);
    });
  }, []);

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
            if (response) onUpdated('newLayer');
          },
        );
      } else {
        createNewLayer(state.instrumentID).then(response => {
          if (response) onUpdated('newLayer');
        });
      }
    }
  };

  const deleteLayer = id => {
    deletingLayer(id).then(response => {
      if (response) onUpdated('deleteLayer');
    });
  };

  const selectedInstrument = () => {
    let instrument = instruments;
    if (selectedStratigraphyID) {
      instrument = instruments.filter(
        e => e.instrument_casing_id === selectedStratigraphyID,
      );
    }
    return instrument;
  };
  return (
    <Styled.Container disable={!hasCasing}>
      <Styled.ButtonContainer>
        <Button
          content={<TranslationText id="addInstrument" />}
          disabled={!isEditable}
          icon="add"
          onClick={createLayer}
          secondary
          size="tiny"
        />
      </Styled.ButtonContainer>

      {selectedInstrument().length === 0 && (
        <Styled.Empty>
          <TranslationText id="nothingToShow" />
        </Styled.Empty>
      )}

      {selectedInstrument().length > 0 && (
        <Styled.ListContainer>
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
