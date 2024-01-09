import React, { useState, useEffect, useCallback } from "react";
import * as Styled from "./styles";
import { useSelector } from "react-redux";
import ProfileHeader from "./components/profileHeader";
import ProfileInfo from "./components/profileInfo";
import ProfileLayers from "./components/profileLayers";
import ProfileAttributes from "./components/profileAttributes";
import { casingData } from "./data/casingdata";
import { fillingData } from "./data/fillingdata";
import { stratigraphyData } from "./data/stratigraphydata";
import ProfileInstrument from "./components/profileInstrument/profileInstrument";
import TranslationText from "../translationText";
import { profileKind } from "./constance";
import { Loader } from "semantic-ui-react";

const Profile = props => {
  const { user, borehole } = useSelector(state => ({
    borehole: state.core_borehole,
    user: state.core_user,
  }));
  const { kind } = props;

  const [isEditable, setIsEditable] = useState(false);
  const [selectedStratigraphy, setSelectedStratigraphy] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [reloadLayer, setReloadLayer] = useState(0);
  const [reloadHeader, setReloadHeader] = useState(0);
  const [reloadAttribute, setReloadAttribute] = useState(0);
  const [attributesBasedKind, setAttributesBasedKind] = useState(null);
  const [stratigraphyKind, setStratigraphyKind] = useState(null);
  const [hasInstrumentWithoutCasing, setHasInstrumentWithoutCasing] =
    useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const onUpdated = attribute => {
    if (
      attribute === "toDepth" ||
      attribute === "fromDepth" ||
      attribute === "lithology" ||
      attribute === "newLayer" ||
      attribute === "casingKind" ||
      attribute === "casingMaterial" ||
      attribute === "casingDrilling" ||
      attribute === "fillMaterial" ||
      attribute === "fillKind"
    ) {
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "deleteLayer" || attribute === "fixErrors") {
      setSelectedLayer(null);
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (
      attribute === "primary" ||
      attribute === "name" ||
      attribute === "date" ||
      attribute === "cloneStratigraphy" ||
      attribute === "fill_name"
    )
      setReloadHeader(reloadHeader => reloadHeader + 1);

    if (attribute === "deleteStratigraphy" || attribute === "newAttribute") {
      setSelectedStratigraphy(null);
      setReloadHeader(reloadHeader => reloadHeader + 1);
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "newAttribute")
      setReloadAttribute(reloadAttribute => reloadAttribute + 1);
  };

  const setKind = useCallback(kind => {
    switch (kind) {
      case "instruments":
        setStratigraphyKind(profileKind.INSTRUMENT);
        break;
      case "stratigraphy":
        setAttributesBasedKind(stratigraphyData);
        setStratigraphyKind(profileKind.STRATIGRAPHY);
        break;
      case "hydrogeology":
        setAttributesBasedKind(stratigraphyData);
        setStratigraphyKind(profileKind.HYDROGEOLOGY);
        break;
      case "casing":
        setAttributesBasedKind(casingData);
        setStratigraphyKind(profileKind.CASING);
        break;
      case "filling":
        setAttributesBasedKind(fillingData);
        setStratigraphyKind(profileKind.FILLING);
        break;
      case "chronostratigraphy":
        break;
      default:
        setAttributesBasedKind(stratigraphyData);
        setStratigraphyKind(profileKind.STRATIGRAPHY);
    }
    onUpdated("newAttribute");
  }, []);

  useEffect(() => {
    if (
      !(
        borehole?.data?.lock === null ||
        borehole?.data?.lock.username !== user?.data?.username ||
        borehole?.data?.role !== "EDIT"
      )
    ) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
    setKind(kind);
    setHasInstrumentWithoutCasing(false);
  }, [setIsEditable, borehole, user, kind, setKind]);

  const set = useCallback(
    e => {
      setSelectedStratigraphy(e);
      setSelectedLayer(null);
    },
    [setSelectedStratigraphy, setSelectedLayer],
  );

  const setSelectedStratigraphyNull = useCallback(() => {
    setSelectedStratigraphy(null);
  }, []);

  return (
    <Styled.MainContainer>
      {stratigraphyKind && borehole.data.id && (
        <ProfileHeader
          boreholeID={borehole.data.id}
          kind={stratigraphyKind}
          isEditable={isEditable}
          reloadHeader={reloadHeader}
          selectedStratigraphy={selectedStratigraphy}
          setSelectedStratigraphy={set}
          setSelectedStratigraphyNull={setSelectedStratigraphyNull}
          hasInstrumentWithoutCasing={hasInstrumentWithoutCasing}
          setIsLoadingData={setIsLoadingData}
        />
      )}

      {isLoadingData && <Loader active />}

      {!isLoadingData &&
        !selectedStratigraphy &&
        stratigraphyKind !== profileKind.INSTRUMENT &&
        stratigraphyKind !== profileKind.CASING &&
        stratigraphyKind !== profileKind.FILLING && (
          <Styled.Empty data-cy="stratigraphy-message">
            <TranslationText
              id={
                borehole.data.lock
                  ? "msgAddStratigraphy"
                  : "msgStratigraphyEmpty"
              }
            />
          </Styled.Empty>
        )}

      {!isLoadingData &&
        !selectedStratigraphy &&
        stratigraphyKind === profileKind.CASING && (
          <Styled.Empty data-cy="casing-message">
            <TranslationText
              id={borehole.data.lock ? "msgAddCasing" : "msgCasingEmpty"}
            />
          </Styled.Empty>
        )}

      {!isLoadingData &&
        !selectedStratigraphy &&
        stratigraphyKind === profileKind.FILLING && (
          <Styled.Empty data-cy="backfill-message">
            <TranslationText
              id={borehole.data.lock ? "msgAddBackfill" : "msgBackfillEmpty"}
            />
          </Styled.Empty>
        )}

      {!isLoadingData &&
        stratigraphyKind !== profileKind.INSTRUMENT &&
        selectedStratigraphy && (
          <Styled.Container>
            <Styled.FirstColumn>
              <ProfileInfo
                data={{
                  kind: stratigraphyKind,
                  selectedStratigraphyID: selectedStratigraphy
                    ? selectedStratigraphy.id
                    : null,
                  isEditable,
                  onUpdated,
                  attribute: attributesBasedKind?.profileInfo,
                  boreholeID: borehole.data.id,
                }}
              />
              <ProfileLayers
                data={{
                  selectedStratigraphyID: selectedStratigraphy
                    ? selectedStratigraphy.id
                    : null,
                  isEditable,
                  selectedLayer,
                  setSelectedLayer: e => {
                    setSelectedLayer(e);
                  },
                  reloadLayer,
                  onUpdated,
                  stratigraphyKind,
                }}
              />
            </Styled.FirstColumn>
            {selectedLayer !== null && (
              <Styled.SecondColumn>
                <ProfileAttributes
                  data={{
                    id: selectedLayer ? selectedLayer.id : null,
                    selectedStratigraphyID: selectedStratigraphy?.id,
                    isEditable,
                    onUpdated,
                    reloadAttribute,
                    attribute: attributesBasedKind?.profileAttribute,
                  }}
                />
              </Styled.SecondColumn>
            )}
          </Styled.Container>
        )}
      {!isLoadingData &&
        stratigraphyKind === profileKind.INSTRUMENT &&
        borehole.data.id && (
          <ProfileInstrument
            borehole={borehole}
            selectedStratigraphyID={selectedStratigraphy?.id}
            isEditable={isEditable}
            reloadLayer={reloadLayer}
            onUpdated={onUpdated}
            setHasInstrumentWithoutCasing={setHasInstrumentWithoutCasing}
            setIsLoadingData={setIsLoadingData}
          />
        )}
    </Styled.MainContainer>
  );
};

export default Profile;
