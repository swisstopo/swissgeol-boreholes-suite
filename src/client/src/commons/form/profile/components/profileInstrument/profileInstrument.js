import React, { useCallback, useEffect, useState } from "react";
import * as Styled from "./styles";
import Instrument from "./components/instrument";
import { Button, Loader } from "semantic-ui-react";
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
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Before any layer or instrument is created for the selected stratigraphy,
  // create a layer or instrument when useEffect() is called the first time after
  // setInstrumentProfileId().
  // If there is already a layer or instrument defined,
  // creating a layer or instrument is only possible via addInstrument and not via
  // useEffect() of instrumentProfileId.
  const [
    isFirstLayerOrFirstInstrumentForStratigraphy,
    setIsFirstLayerOrFirstInstrumentForStratigraphy,
  ] = useState(false);

  const createLayerOrInstrument = useCallback(() => {
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
  }, [instrumentProfileId, onUpdated, selectedStratigraphyID]);

  const createStratigraphy = useCallback(boreholeID => {
    createNewStratigraphy(boreholeID, profileKind.INSTRUMENT).then(id => {
      setInstrumentProfileId(id);
      setIsFirstLayerOrFirstInstrumentForStratigraphy(true);
    });
  }, []);

  const getInstrumentProfile = useCallback(() => {
    setIsLoadingData(true);
    getProfile(borehole.data.id, profileKind.INSTRUMENT).then(response => {
      if (response.length > 0) {
        setInstrumentProfileId(response[0].id);
      }
      setIsLoadingData(false);
    });
  }, [borehole]);

  useEffect(() => {
    getInstrumentProfile();
  }, [getInstrumentProfile]);

  const setData = useCallback(instrumentID => {
    setIsLoadingData(true);
    getData(instrumentID).then(response => {
      setInstruments(response);
      setIsLoadingData(false);
    });
  }, []);

  useEffect(() => {
    setHasInstrumentWithoutCasing(
      instruments.some(i => i.instrument_casing_id === 0),
    );
  }, [instruments, setHasInstrumentWithoutCasing]);

  useEffect(() => {
    if (instrumentProfileId) {
      if (isFirstLayerOrFirstInstrumentForStratigraphy) {
        createLayerOrInstrument();
        setIsFirstLayerOrFirstInstrumentForStratigraphy(false);
      }
      setData(instrumentProfileId);
    }
  }, [
    instrumentProfileId,
    reloadLayer,
    setData,
    reload,
    isFirstLayerOrFirstInstrumentForStratigraphy,
    createLayerOrInstrument,
  ]);

  const addInstrument = () => {
    if (instrumentProfileId) {
      createLayerOrInstrument();
    } else {
      createStratigraphy(borehole.data.id);
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
            onClick={addInstrument}
            secondary
            size="tiny"
          />
        </Styled.ButtonContainer>
      )}

      {isLoadingData ? (
        <Loader active />
      ) : filterInstrumentsByProfile().length === 0 ? (
        <Styled.Empty data-cy="instrument-message">
          <TranslationText
            id={borehole.data.lock ? "msgAddInstrument" : "msgInstrumentsEmpty"}
          />
        </Styled.Empty>
      ) : null}

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
