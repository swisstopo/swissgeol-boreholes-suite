import { useCallback, useContext, useEffect, useState } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { theme } from "../../../../../AppTheme";
import TranslationText from "../../../../../components/legacyComponents/translationText.jsx";
import { FullPageCentered } from "../../../../../components/styledComponents.js";
import { EditStateContext } from "../../../editStateContext.tsx";
import { stratigraphyData } from "./data/stratigraphydata.js";
import LithologyAttributes from "./lithologyAttributes";
import ProfileHeader from "./lithologyHeader";
import LithologyInfo from "./lithologyInfo/infoList/lithologyInfo.jsx";
import ProfileLayers from "./lithologyLayers";
import * as Styled from "./styles.js";

const Lithology = () => {
  const { editingEnabled } = useContext(EditStateContext);
  const [selectedStratigraphy, setSelectedStratigraphy] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [reloadLayer, setReloadLayer] = useState(0);
  const [reloadHeader, setReloadHeader] = useState(0);
  const [reloadAttribute, setReloadAttribute] = useState(0);
  const [attributesBasedKind, setAttributesBasedKind] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const onUpdated = attribute => {
    if (attribute === "toDepth" || attribute === "fromDepth" || attribute === "lithology" || attribute === "newLayer") {
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "deleteLayer" || attribute === "fixErrors") {
      setSelectedLayer(null);
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (
      attribute === "isPrimary" ||
      attribute === "name" ||
      attribute === "quality" ||
      attribute === "date" ||
      attribute === "cloneStratigraphy"
    )
      setReloadHeader(reloadHeader => reloadHeader + 1);

    if (attribute === "deleteStratigraphy" || attribute === "newAttribute") {
      setSelectedStratigraphy(null);
      setReloadHeader(reloadHeader => reloadHeader + 1);
      setReloadLayer(reloadLayer => reloadLayer + 1);
    }

    if (attribute === "newAttribute") setReloadAttribute(reloadAttribute => reloadAttribute + 1);
  };

  useEffect(() => {
    setAttributesBasedKind(stratigraphyData);
    onUpdated("newAttribute");
  }, []);

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
      <ProfileHeader
        reloadHeader={reloadHeader}
        selectedStratigraphy={selectedStratigraphy}
        setSelectedStratigraphy={set}
        setSelectedStratigraphyNull={setSelectedStratigraphyNull}
        setIsLoadingData={setIsLoadingData}
      />
      {isLoadingData && (
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      )}

      {!isLoadingData && !selectedStratigraphy && (
        <Styled.Empty data-cy="stratigraphy-message">
          <TranslationText id={editingEnabled ? "msgAddStratigraphy" : "msgStratigraphyEmpty"} />
        </Styled.Empty>
      )}

      {!isLoadingData && selectedStratigraphy && (
        <Styled.Container>
          <Styled.FirstColumn>
            <LithologyInfo
              data={{
                selectedStratigraphyID: selectedStratigraphy ? selectedStratigraphy.id : null,
                onUpdated,
                attribute: attributesBasedKind?.profileInfo,
              }}
            />
            <ProfileLayers
              data={{
                selectedStratigraphyID: selectedStratigraphy ? selectedStratigraphy.id : null,
                isEditable: editingEnabled,
                selectedLayer,
                setSelectedLayer: e => {
                  setSelectedLayer(e);
                },
                reloadLayer,
                onUpdated,
              }}
            />
          </Styled.FirstColumn>
          {selectedLayer !== null && (
            <Styled.SecondColumn>
              <LithologyAttributes
                id={selectedLayer?.id}
                reloadLayer={reloadLayer}
                setReloadLayer={setReloadLayer}
                setSelectedLayer={setSelectedLayer}
                data={{
                  selectedStratigraphyID: selectedStratigraphy?.id,
                  isEditable: editingEnabled,
                  onUpdated,
                  reloadAttribute,
                  layerAttributes: attributesBasedKind?.profileAttribute,
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
