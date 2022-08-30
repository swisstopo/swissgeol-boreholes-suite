import React, { useCallback, useEffect, useState, useRef } from 'react';
import * as Styled from './styles';
import { Button } from 'semantic-ui-react';
import TranslationText from '../../../translationText';
import { createLayerApi, getData } from './api';
import ProfileLayersValidation from './components/profileLayersValidation';

const ProfileLayers = props => {
  const {
    isEditable,
    selectedStratigraphyID,
    selectedLayer,
    setSelectedLayer,
    reloadLayer,
    onUpdated,
  } = props.data;
  const [layers, setLayers] = useState(null);
  const [showDelete, setShowDelete] = useState();

  const mounted = useRef(false);

  const setData = useCallback(stratigraphyID => {
    getData(stratigraphyID).then(res => {
      if (mounted.current) {
        setLayers(res);
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (selectedStratigraphyID && mounted.current) {
      setData(selectedStratigraphyID);
    } else {
      setLayers(null);
    }
    return () => {
      mounted.current = false;
    };
  }, [selectedStratigraphyID, reloadLayer, setData]);

  const createNewLayer = () => {
    createLayerApi(selectedStratigraphyID).then(res => {
      if (res) {
        onUpdated('newLayer');
      }
    });
  };

  const setSelectedLayerFunc = item => {
    setSelectedLayer(item);
  };
  return (
    <Styled.Container>
      {isEditable && selectedStratigraphyID !== null && (
        <div>
          <Button
            content={<TranslationText id="add" />}
            icon="add"
            onClick={createNewLayer}
            secondary
            size="small"
            style={{ marginBottom: '10px', padding: '13px 20px' }}
          />
        </div>
      )}
      {layers?.data?.length === 0 && (
        <Styled.Empty>
          <TranslationText id="nothingToShow" />
        </Styled.Empty>
      )}

      {layers !== null && layers?.data?.length !== 0 && (
        <ProfileLayersValidation
          data={{
            layers,
            isEditable,
            onUpdated,
            selectedLayer,
            showDelete,
            setShowDelete,
            selectedStratigraphyID,
            setSelectedLayer: setSelectedLayerFunc,
          }}
        />
      )}
    </Styled.Container>
  );
};

export default ProfileLayers;
