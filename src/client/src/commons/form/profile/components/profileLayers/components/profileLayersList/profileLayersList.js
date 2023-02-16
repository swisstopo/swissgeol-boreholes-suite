import React, { useCallback, useEffect, useState } from "react";
import { Icon, Popup } from "semantic-ui-react";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import ClearIcon from "@mui/icons-material/Clear";
import { Stack, Tooltip } from "@mui/material";
import TranslationText from "../../../../../translationText";
import { NumericFormat } from "react-number-format";
import { withTranslation } from "react-i18next";
import * as Styled from "./styles";

const ProfileLayersList = props => {
  const {
    layers,
    isEditable,
    selectedLayer,
    showDelete,
    setShowDelete,
    setSelectedLayer,
    item,
  } = props.data;
  const { t } = props;
  const [isTopHasWarning, setIsTopHasWarning] = useState(false);
  const [isBottomHasWarning, setIsBottomHasWarning] = useState(false);
  const [showTopPopup, setShowTopPopup] = useState(false);
  const [showBottomPopup, setShowBottomPopup] = useState(false);

  const checkHasWarning = useCallback(() => {
    if (
      item?.depth_from === null ||
      item?.validation?.topOverlap ||
      item?.validation?.topDisjoint ||
      item?.validation?.invertedDepth
    ) {
      setIsTopHasWarning(true);
    } else {
      setIsTopHasWarning(false);
    }
    if (
      item?.depth_from === null ||
      item?.validation?.missingFrom ||
      item?.validation?.invertedDepth
    ) {
      setShowTopPopup(true);
    } else {
      setShowTopPopup(false);
    }

    if (
      item?.depth_to === null ||
      item?.validation?.bottomOverlap ||
      item?.validation?.bottomDisjoint ||
      item?.validation?.invertedDepth
    ) {
      setIsBottomHasWarning(true);
    } else {
      setIsBottomHasWarning(false);
    }
    if (
      item?.depth_to === null ||
      item?.validation?.missingTo ||
      item?.validation?.invertedDepth
    ) {
      setShowBottomPopup(true);
    } else {
      setShowBottomPopup(false);
    }
  }, [item]);
  useEffect(() => {
    checkHasWarning();
  }, [checkHasWarning]);

  return (
    <>
      <Styled.MyCard
        onClick={() => setSelectedLayer(item)}
        style={{
          backgroundColor: selectedLayer?.id === item?.id && "lightgrey",
        }}>
        <Styled.CardPattern
          id="pattern"
          b={item?.rgb?.[2]}
          g={item?.rgb?.[1]}
          r={item?.rgb?.[0]}
          style={{
            backgroundImage: item?.pattern
              ? 'url("' +
                process.env.PUBLIC_URL +
                "/img/lit/" +
                item?.pattern +
                '")'
              : "",
          }}
        />
        {showDelete !== item?.id && (
          <>
            <Styled.CardInfo id="info">
              <Styled.Text warning={isTopHasWarning} id="text">
                {isTopHasWarning && (
                  <Icon name="warning sign" style={{ color: "red" }} />
                )}
                {showTopPopup ? (
                  <Popup
                    basic
                    content={
                      item?.validation?.invertedDepth ? (
                        <TranslationText id="invertedDepth" />
                      ) : (
                        <TranslationText id="errrorStartPoint" />
                      )
                    }
                    position="bottom left"
                    trigger={
                      <div>
                        {item?.validation?.invertedDepth && item?.depth_from} m
                      </div>
                    }
                  />
                ) : (
                  <NumericFormat
                    value={item?.depth_from}
                    thousandSeparator="'"
                    suffix=" m"
                    displayType="text"
                  />
                )}
              </Styled.Text>
              <Styled.Text
                bold
                warning={item?.validation?.bedrockLitStratiWrong}>
                {item?.title ? (
                  <Styled.DomainTxt
                    id={item?.title}
                    schema={layers?.config.title}
                  />
                ) : (
                  "-"
                )}
              </Styled.Text>
              <Styled.Text warning={item?.validation?.bedrockChronoWrong}>
                {item?.subtitle ? (
                  <Styled.DomainTxt
                    id={item?.subtitle}
                    schema={layers?.config.subtitle}
                  />
                ) : (
                  "-"
                )}
              </Styled.Text>
              <Styled.Text small warning={item?.validation?.bedrockLitPetWrong}>
                {item?.description ? (
                  <Styled.DomainTxt
                    id={item?.description}
                    schema={layers?.config.description}
                  />
                ) : (
                  "-"
                )}
              </Styled.Text>
              <Styled.Text warning={isBottomHasWarning}>
                {isBottomHasWarning && (
                  <Icon name="warning sign" style={{ color: "red" }} />
                )}
                {showBottomPopup ? (
                  <Popup
                    basic
                    content={
                      item?.validation?.invertedDepth ? (
                        <TranslationText id="invertedDepth" />
                      ) : (
                        <TranslationText id="errorEndPoint" />
                      )
                    }
                    hoverable
                    position="bottom left"
                    trigger={
                      <div>
                        {item?.validation?.invertedDepth && item?.depth_to} m
                      </div>
                    }
                  />
                ) : (
                  <NumericFormat
                    value={item?.depth_to}
                    thousandSeparator="'"
                    suffix=" m"
                    displayType="text"
                  />
                )}
              </Styled.Text>
            </Styled.CardInfo>
            {isEditable && (
              <Stack
                direction="row"
                sx={{ marginLeft: "auto", padding: "3px" }}>
                {selectedLayer?.id !== item?.id && (
                  <>
                    <Tooltip title={t("edit")}>
                      <ModeEditIcon onClick={() => setSelectedLayer(item)} />
                    </Tooltip>
                    <Tooltip title={t("delete")}>
                      <DeleteIcon
                        sx={{ color: "red", opacity: 0.7 }}
                        onClick={() => {
                          setShowDelete(item?.id);
                        }}
                      />
                    </Tooltip>
                  </>
                )}
                {selectedLayer?.id === item?.id && (
                  <Tooltip title={t("stop-editing")}>
                    <ClearIcon onClick={() => setSelectedLayer(null)} />
                  </Tooltip>
                )}
              </Stack>
            )}
          </>
        )}
      </Styled.MyCard>
    </>
  );
};

export default withTranslation()(ProfileLayersList);
