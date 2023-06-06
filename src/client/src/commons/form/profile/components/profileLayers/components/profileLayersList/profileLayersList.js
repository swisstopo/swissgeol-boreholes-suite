import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext,
} from "react";
import { Icon, Popup } from "semantic-ui-react";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import ClearIcon from "@mui/icons-material/Clear";
import { Stack, Tooltip } from "@mui/material";
import TranslationText from "../../../../../translationText";
import { NumericFormat } from "react-number-format";
import { withTranslation } from "react-i18next";
import * as Styled from "./styles";
import { deleteLayer } from "../../../../../../../api-lib";
import { AlertContext } from "../../../../../../alert/alertContext";
import { useLithostratigraphies } from "../../../../../../../api/fetchApiV2";

const ProfileLayersList = props => {
  const {
    isEditable,
    selectedLayer,
    showDelete,
    setShowDelete,
    setSelectedLayer,
    itemWithValidation,
    item,
    isStratigraphy,
    onUpdated,
  } = props.data;
  const { t, i18n } = props;
  const [isTopHasWarning, setIsTopHasWarning] = useState(false);
  const [isBottomHasWarning, setIsBottomHasWarning] = useState(false);
  const [showTopPopup, setShowTopPopup] = useState(false);
  const [showBottomPopup, setShowBottomPopup] = useState(false);
  const alertContext = useContext(AlertContext);

  const { data: lithostrati } = useLithostratigraphies(item?.stratigraphyId);
  const [lithostratiColor, setLithostratiColor] = useState([255, 255, 255]);
  useEffect(() => {
    if (lithostrati) {
      const correspondingLithostrati = lithostrati.find(x => {
        const middle = (item?.fromDepth + item?.toDepth) / 2;
        return x.fromDepth <= middle && middle <= x.toDepth;
      });
      setLithostratiColor(
        JSON.parse(correspondingLithostrati?.lithostratigraphy?.conf ?? null)
          ?.color ?? [255, 255, 255],
      );
    } else {
      setLithostratiColor([255, 255, 255]);
    }
  }, [item, lithostrati]);

  const checkHasWarning = useCallback(() => {
    if (
      itemWithValidation?.depth_from === null ||
      itemWithValidation?.validation?.topOverlap ||
      itemWithValidation?.validation?.topDisjoint ||
      itemWithValidation?.validation?.invertedDepth
    ) {
      setIsTopHasWarning(true);
    } else {
      setIsTopHasWarning(false);
    }
    if (
      itemWithValidation?.depth_from === null ||
      itemWithValidation?.validation?.missingFrom ||
      itemWithValidation?.validation?.invertedDepth
    ) {
      setShowTopPopup(true);
    } else {
      setShowTopPopup(false);
    }

    if (
      itemWithValidation?.depth_to === null ||
      itemWithValidation?.validation?.bottomOverlap ||
      itemWithValidation?.validation?.bottomDisjoint ||
      itemWithValidation?.validation?.invertedDepth
    ) {
      setIsBottomHasWarning(true);
    } else {
      setIsBottomHasWarning(false);
    }
    if (
      itemWithValidation?.depth_to === null ||
      itemWithValidation?.validation?.missingTo ||
      itemWithValidation?.validation?.invertedDepth
    ) {
      setShowBottomPopup(true);
    } else {
      setShowBottomPopup(false);
    }
  }, [itemWithValidation]);
  useEffect(() => {
    checkHasWarning();
  }, [checkHasWarning]);

  const uselessStrings = useMemo(
    () => [
      "keine Angabe",
      "sans indication",
      "senza indicazioni",
      "not specified",
    ],
    [],
  );

  const mainProps = useMemo(() => {
    const lithology = item?.lithology?.[i18n.language] ?? null;
    const uscs1 = item?.uscs1?.[i18n.language] ?? null;
    const grainSize1 = item?.grainSize1?.[i18n.language] ?? null;
    let color = [];
    item?.codelists
      .filter(c => c.schema === "mlpr112")
      .forEach(element => {
        color.push(element[i18n.language]);
      });
    const strings = [lithology, uscs1, grainSize1, color];

    return strings
      .flat()
      .filter(s => !uselessStrings.includes(s) && s !== null)
      .join(", ");
  }, [item, i18n.language, uselessStrings]);

  const secondaryProps = useMemo(() => {
    const uscs2 = item?.uscs2?.[i18n.language] ?? null;
    const grainSize2 = item?.grainSize2?.[i18n.language] ?? null;

    let uscs3 = [];
    item?.codelists
      .filter(c => c.schema === "mcla101")
      .forEach(element => {
        uscs3.push(element[i18n.language]);
      });

    let grainshape = [];
    item?.codelists
      .filter(c => c.schema === "mlpr110")
      .forEach(element => {
        grainshape.push(element[i18n.language]);
      });

    let angularity = [];
    item?.codelists
      .filter(c => c.schema === "mlpr115")
      .forEach(element => {
        angularity.push(element[i18n.language]);
      });

    let organicCompounds = [];
    item?.codelists
      .filter(c => c.schema === "mlpr108")
      .forEach(element => {
        organicCompounds.push(element[i18n.language]);
      });

    let debris = [];
    item?.codelists
      .filter(c => c.schema === "mcla107")
      .forEach(element => {
        debris.push(element[i18n.language]);
      });

    const striae = item?.isStriae ? t("striae") : null;

    const consistance = item?.consistance?.[i18n.language] ?? null;
    const plasticity = item?.plasticity?.[i18n.language] ?? null;
    const compactness = item?.compactness?.[i18n.language] ?? null;
    const cohesion = item?.cohesion?.[i18n.language] ?? null;
    const gradation = item?.gradation?.[i18n.language] ?? null;
    const humidity = item?.humidity?.[i18n.language] ?? null;
    const alteration = item?.alteration?.[i18n.language] ?? null;

    const strings = [
      uscs2,
      grainSize2,
      uscs3,
      grainshape,
      angularity,
      organicCompounds,
      debris,
      striae,
      consistance,
      plasticity,
      compactness,
      cohesion,
      gradation,
      humidity,
      alteration,
    ];

    return strings
      .flat()
      .filter(s => !uselessStrings.includes(s) && s !== null)
      .join(", ");
  }, [item, i18n.language, t, uselessStrings]);

  const isItemSelected = selectedLayer?.id === itemWithValidation?.id;

  const immediatelyDelete = id => {
    deleteLayer(id, 0)
      .then(response => {
        if (response.data.success) {
          onUpdated("deleteLayer");
        } else {
          alertContext.error(response.data.message);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  return (
    <>
      <Styled.MyCard
        onClick={() => setSelectedLayer(itemWithValidation)}
        style={{
          backgroundColor: isItemSelected && "lightgrey",
        }}>
        <Styled.CardPattern
          id="pattern"
          r={lithostratiColor[0]}
          g={lithostratiColor[1]}
          b={lithostratiColor[2]}
          style={{
            backgroundImage: itemWithValidation?.pattern
              ? 'url("' +
                process.env.PUBLIC_URL +
                "/img/lit/" +
                itemWithValidation?.pattern +
                '")'
              : "",
          }}
        />
        {showDelete !== itemWithValidation?.id && (
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
                      itemWithValidation?.validation?.invertedDepth ? (
                        <TranslationText id="invertedDepth" />
                      ) : (
                        <TranslationText id="errrorStartPoint" />
                      )
                    }
                    position="bottom left"
                    trigger={
                      <div>
                        {itemWithValidation?.validation?.invertedDepth &&
                          itemWithValidation?.depth_from}{" "}
                        m
                      </div>
                    }
                  />
                ) : (
                  <NumericFormat
                    value={itemWithValidation?.depth_from}
                    thousandSeparator="'"
                    suffix=" m"
                    displayType="text"
                  />
                )}
              </Styled.Text>

              <Styled.Text
                bold
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  lineHeight: "1.2",
                }}>
                {mainProps}
              </Styled.Text>
              <Styled.Text
                small
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: "3",
                  WebkitBoxOrient: "vertical",
                  lineHeight: "1.3",
                }}>
                {secondaryProps}
              </Styled.Text>
              <Styled.Text warning={isBottomHasWarning}>
                {isBottomHasWarning && (
                  <Icon name="warning sign" style={{ color: "red" }} />
                )}
                {showBottomPopup ? (
                  <Popup
                    basic
                    content={
                      itemWithValidation?.validation?.invertedDepth ? (
                        <TranslationText id="invertedDepth" />
                      ) : (
                        <TranslationText id="errorEndPoint" />
                      )
                    }
                    hoverable
                    position="bottom left"
                    trigger={
                      <div>
                        {itemWithValidation?.validation?.invertedDepth &&
                          itemWithValidation?.depth_to}{" "}
                        m
                      </div>
                    }
                  />
                ) : (
                  <NumericFormat
                    value={itemWithValidation?.depth_to}
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
                {!isItemSelected && (
                  <>
                    <Tooltip title={t("edit")}>
                      <ModeEditIcon
                        onClick={() => setSelectedLayer(itemWithValidation)}
                      />
                    </Tooltip>
                    <Tooltip title={t("delete")}>
                      <DeleteIcon
                        sx={{ color: "red", opacity: 0.7 }}
                        onClick={e => {
                          e.stopPropagation();
                          isStratigraphy
                            ? setShowDelete(itemWithValidation?.id)
                            : immediatelyDelete(itemWithValidation?.id);
                        }}
                      />
                    </Tooltip>
                  </>
                )}
                {isItemSelected && (
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
