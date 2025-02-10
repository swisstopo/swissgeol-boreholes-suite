import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { Loader } from "semantic-ui-react";
import { theme } from "../../../../../AppTheme";
import TranslationText from "../../../../../components/legacyComponents/translationText.jsx";
import { stratigraphyData } from "./data/stratigraphydata.js";
import LithologyAttributes from "./lithologyAttributes";
import ProfileHeader from "./lithologyHeader";
import LithologyInfo from "./lithologyInfo";
import ProfileLayers from "./lithologyLayers";
import * as Styled from "./styles.js";

const Lithology = ({ checkLock }) => {
  const { user, borehole } = useSelector(state => ({
    borehole: state.core_borehole,
    user: state.core_user,
  }));
  const queryClient = useQueryClient();

  const [isEditable, setIsEditable] = useState(false);
  const [selectedStratigraphy, setSelectedStratigraphy] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [reloadLayer, setReloadLayer] = useState(0);
  const [reloadHeader, setReloadHeader] = useState(0);
  const [reloadAttribute, setReloadAttribute] = useState(0);
  const [attributesBasedKind, setAttributesBasedKind] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const onUpdated = useCallback(
    attribute => {
      if (
        attribute === "newLayer" ||
        attribute === "deleteLayer" ||
        attribute === "deleteStratigraphy" ||
        attribute === "newAttribute"
      ) {
        queryClient.invalidateQueries(["borehole", parseInt(borehole.data.id, 10)]);
      }

      if (["toDepth", "fromDepth", "lithology", "newLayer"].includes(attribute)) {
        setReloadLayer(prev => prev + 1);
      }
      if (["deleteLayer", "fixErrors"].includes(attribute)) {
        setSelectedLayer(null);
        setReloadLayer(prev => prev + 1);
      }
      if (["isPrimary", "name", "quality", "date", "cloneStratigraphy"].includes(attribute)) {
        setReloadHeader(prev => prev + 1);
      }
      if (["deleteStratigraphy", "newAttribute"].includes(attribute)) {
        setSelectedStratigraphy(null);
        setReloadHeader(prev => prev + 1);
        setReloadLayer(prev => prev + 1);
      }
      if (attribute === "newAttribute") {
        setReloadAttribute(prev => prev + 1);
      }
    },
    [queryClient, borehole?.data?.id],
  );

  useEffect(() => {
    if (
      !(borehole?.data?.lock === null || borehole?.data?.lock.id !== user?.data?.id || borehole?.data?.role !== "EDIT")
    ) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
    setAttributesBasedKind(stratigraphyData);
    onUpdated("newAttribute");
  }, [borehole, user, onUpdated]);

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
    <Stack
      direction="column"
      sx={{
        flex: " 1 1 100%",
        overflow: "hidden",
        p: 3,
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.border.light}`,
      }}>
      {borehole.data.id && (
        <ProfileHeader
          boreholeID={borehole.data.id}
          isEditable={isEditable}
          reloadHeader={reloadHeader}
          selectedStratigraphy={selectedStratigraphy}
          setSelectedStratigraphy={set}
          setSelectedStratigraphyNull={setSelectedStratigraphyNull}
          setIsLoadingData={setIsLoadingData}
        />
      )}

      {isLoadingData && <Loader active />}

      {!isLoadingData && !selectedStratigraphy && (
        <Styled.Empty data-cy="stratigraphy-message">
          <TranslationText id={borehole.data.lock ? "msgAddStratigraphy" : "msgStratigraphyEmpty"} />
        </Styled.Empty>
      )}

      {!isLoadingData && selectedStratigraphy && (
        <Styled.Container>
          <Styled.FirstColumn>
            <LithologyInfo
              data={{
                selectedStratigraphyID: selectedStratigraphy ? selectedStratigraphy.id : null,
                isEditable,
                onUpdated,
                checkLock,
                attribute: attributesBasedKind?.profileInfo,
              }}
            />
            <ProfileLayers
              data={{
                selectedStratigraphyID: selectedStratigraphy ? selectedStratigraphy.id : null,
                isEditable,
                selectedLayer,
                setSelectedLayer: e => {
                  setSelectedLayer(e);
                },
                reloadLayer,
                onUpdated,
                boreholeId: borehole.data.id,
              }}
            />
          </Styled.FirstColumn>
          {selectedLayer !== null && (
            <Styled.SecondColumn>
              <LithologyAttributes
                data={{
                  id: selectedLayer ? selectedLayer.id : null,
                  selectedStratigraphyID: selectedStratigraphy?.id,
                  isEditable,
                  onUpdated,
                  reloadAttribute,
                  checkLock,
                  attribute: attributesBasedKind?.profileAttribute,
                }}
              />
            </Styled.SecondColumn>
          )}
        </Styled.Container>
      )}
    </Stack>
  );
};

export default Lithology;
