import { useState, useEffect, useCallback } from "react";
import * as Styled from "./styles";
import { Button } from "semantic-ui-react";
import TranslationText from "./../../../translationText";
import { createNewStratigraphy } from "./api";
import { fetchStratigraphyByBoreholeId } from "../../../../../api/fetchApiV2";
import ProfileHeaderList from "./components/profileHeaderList";

const ProfileHeader = props => {
  const { boreholeID, isEditable, reloadHeader, selectedStratigraphy, setSelectedStratigraphy, setIsLoadingData } =
    props;

  const [profiles, setProfiles] = useState([]);

  const setStratigraphy = useCallback(
    item => {
      setSelectedStratigraphy(item);
    },
    [setSelectedStratigraphy],
  );

  const setSpecialData = useCallback(
    data => {
      if (!selectedStratigraphy) {
        setStratigraphy(data?.[0]);
      }
    },
    [selectedStratigraphy, setStratigraphy],
  );

  const setData = useCallback(
    id => {
      setIsLoadingData(true);
      fetchStratigraphyByBoreholeId(id).then(data => {
        setProfiles(data);
        setSpecialData(data);
        setIsLoadingData(false);
      });
    },
    [setSpecialData, setIsLoadingData],
  );

  useEffect(() => {
    if (boreholeID) {
      setData(boreholeID);
    }
  }, [boreholeID, reloadHeader, setData]);

  const createStratigraphy = () => {
    createNewStratigraphy(boreholeID).then(data => {
      if (data) setData(boreholeID);
    });
  };

  return (
    <Styled.Container>
      <Styled.ButtonContainer>
        {isEditable && (
          <Button
            data-cy="add-stratigraphy-button"
            content={<TranslationText id="stratigraphy" />}
            icon="add"
            onClick={createStratigraphy}
            secondary
            size="small"
          />
        )}

        <ProfileHeaderList
          profiles={profiles}
          selectedStratigraphy={selectedStratigraphy}
          setSelectedStratigraphy={setStratigraphy}
        />
      </Styled.ButtonContainer>
    </Styled.Container>
  );
};

export default ProfileHeader;
