import React, { useState, useEffect, useCallback } from "react";
import * as Styled from "./styles";
import { Button } from "semantic-ui-react";
import TranslationText from "./../../../translationText";
import { getData, createNewStratigraphy } from "./api";
import { profileKind } from "../../constance";
import ProfileHeaderList from "./components/profileHeaderList";

const ProfileHeader = props => {
  const {
    boreholeID,
    kind,
    isEditable,
    reloadHeader,
    selectedStratigraphy,
    setSelectedStratigraphy,
    setSelectedStratigraphyNull,
    setIsLoadingData,
  } = props;

  const [profiles, setProfiles] = useState([]);
  const [showAllInstrument, setShowAllInstrument] = useState(false);

  const setStratigraphy = useCallback(
    item => {
      setSelectedStratigraphy(item);
      setShowAllInstrument(false);
    },
    [setSelectedStratigraphy],
  );

  const setStratigraphyNull = useCallback(() => {
    setSelectedStratigraphyNull();
    setShowAllInstrument(!showAllInstrument);
  }, [setSelectedStratigraphyNull, showAllInstrument]);

  const setSpecialData = useCallback(
    data => {
      if (!selectedStratigraphy && kind !== profileKind.INSTRUMENT) {
        setStratigraphy(data?.[0]);
      } else if (
        !selectedStratigraphy &&
        kind === profileKind.INSTRUMENT &&
        !showAllInstrument
      ) {
        setStratigraphyNull();
      }
    },
    [
      selectedStratigraphy,
      setStratigraphy,
      setStratigraphyNull,
      showAllInstrument,
      kind,
    ],
  );

  const setData = useCallback(
    (id, kind) => {
      setIsLoadingData(true);
      getData(id, kind).then(data => {
        setProfiles(data);
        setSpecialData(data);
        setIsLoadingData(false);
      });
    },
    [setSpecialData, setIsLoadingData],
  );

  useEffect(() => {
    if (boreholeID) {
      setData(boreholeID, kind);
    }
  }, [boreholeID, reloadHeader, kind, setData]);

  useEffect(() => {
    setProfiles([]);
  }, [kind]);

  const createStratigraphy = () => {
    createNewStratigraphy(boreholeID, kind).then(data => {
      if (data) setData(boreholeID, kind);
    });
  };

  const setText = (
    <>
      {(kind === profileKind.STRATIGRAPHY && (
        <TranslationText id="stratigraphy" />
      )) ||
        ""}
    </>
  );

  return (
    <Styled.Container>
      <Styled.ButtonContainer>
        {isEditable && (
          <Button
            data-cy="add-stratigraphy-button"
            content={setText}
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
