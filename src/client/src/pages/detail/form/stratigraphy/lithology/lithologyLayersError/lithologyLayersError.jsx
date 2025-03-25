import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, Radio } from "semantic-ui-react";
import { deleteLayer, gapLayer } from "../../../../../../api-lib";
import { addBedrock, fetchLayerById } from "../../../../../../api/fetchApiV2.js";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import TranslationText from "../../../../../../components/legacyComponents/translationText.jsx";
import ErrorTypes from "./errorTypes";
import * as Styled from "./styles.js";

const LithologyLayersError = props => {
  const { title, isEditable, id, isInside, onUpdated, layerIndex, layerLength, closeDelete } = props.data;
  const { setDeleteParams } = props;
  const [showSolution, setShowSolution] = useState();
  const [error, setError] = useState();
  const [resolvingAction, setResolvingAction] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  useEffect(() => {
    let e;

    switch (title) {
      case "missingBedrock":
        e = ErrorTypes[0];
        break;
      case "wrongDepth":
        e = ErrorTypes[5];
        break;
      case "invertedDepth":
        e = ErrorTypes[1];
        break;
      case "topOverlap":
        e = ErrorTypes[2];
        break;
      case "topDisjoint":
        e = ErrorTypes[3];
        break;
      case "missingLayers":
        e = ErrorTypes[4];
        break;
      case "delete":
        e = ErrorTypes[6];
        break;
      default:
        e = null;
    }
    setError(e);
    if (e === ErrorTypes[6]) {
      setIsDelete(true);
      setShowSolution(id);
    } else setIsDelete(false);
  }, [title, id]);

  const resolving = title => {
    if (title === "errorGapSolution_fillWithUndefined" || title === "deletelayer") return 0;
    if (title === "errorGapSolution_extendUpperLayer" || title === "extendupper") return 1;
    if (
      title === "errorGapSolution_extendLowerToZero" ||
      title === "errorGapSolution_extendLowerLayer" ||
      title === "extendlower"
    )
      return 2;
  };
  const handleResolvingAction = (e, { value }) => {
    e.stopPropagation();
    setResolvingAction(value);
  };
  const onCancelClicked = () => {
    setShowSolution();
    setResolvingAction(null);
    if (isDelete) closeDelete();
  };
  const sendDataToServer = () => {
    onCancelClicked();

    if ((isInside && !isDelete) || title === "missingLayers") {
      gapLayer(id, resolvingAction)
        .then(response => {
          if (response.data.success) {
            onUpdated("fixErrors");
          } else {
            showAlert(response.data.message, "error");
          }
        })
        .catch(error => {
          console.error(error);
        });
    } else if (title === "missingBedrock") {
      addBedrock(id)
        .then(response => {
          if (response) {
            onUpdated("fixErrors");
          }
        })
        .catch(error => {
          console.error(error);
        });
    } else if (isDelete) {
      fetchLayerById(id).then(response => {
        setDeleteParams({
          id: id,
          resolvingAction: resolvingAction,
          layer: response,
        });
        deleteLayer(id, resolvingAction)
          .then(response => {
            if (response.data.success) {
              onUpdated("deleteLayer");
            } else {
              showAlert(response.data.message, "error");
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      });
    }
  };
  return (
    <Styled.ErrorCard isDelete={isDelete} isFirstInList={error?.messageId === "errorStartWrong"}>
      {!isDelete && (
        <Styled.Row
          onClick={() => {
            if (isEditable) setShowSolution(id);
          }}>
          <Styled.ErrorMessageContainer>
            <Icon name="warning sign" />
            <TranslationText id={error?.messageId} />
          </Styled.ErrorMessageContainer>

          {isEditable && showSolution !== id && (
            <Styled.WrenchButtonContainer>
              <Styled.CardButton
                basic
                color="red"
                icon
                onClick={() => {
                  setShowSolution(id);
                }}
                size="mini">
                <Icon name="wrench" />
              </Styled.CardButton>
            </Styled.WrenchButtonContainer>
          )}
        </Styled.Row>
      )}

      {showSolution === id && !isDelete && (
        <Styled.SolutionContainer>
          {error.id !== 5 && <Styled.HowToResolveContainer>{t("errorHowToResolve")}</Styled.HowToResolveContainer>}
          {error?.solutions?.map((e, index) => (
            <div key={index} style={{ marginTop: 2 }}>
              {error.solutions.length > 1 && (
                <Radio
                  checked={resolvingAction === resolving(e)}
                  name="radioGroup"
                  onChange={handleResolvingAction}
                  style={{ marginRight: 4 }}
                  value={resolving(e)}
                />
              )}
              <TranslationText id={e} />
            </div>
          ))}
          <Styled.CardButtonContainer>
            <Styled.CardButton
              basic
              icon
              size="mini"
              onClick={() => {
                onCancelClicked();
              }}>
              <Icon name="cancel" />
              {t("cancel")}
            </Styled.CardButton>
            {error?.id !== 5 && (
              <Styled.CardButton
                disabled={resolvingAction === null && error?.id !== 0}
                icon
                onClick={sendDataToServer}
                secondary
                size="mini">
                {error?.id !== 0 && (
                  <>
                    <Icon name="check" />
                    {t("confirm")}
                  </>
                )}
                {error?.id === 0 && (
                  <>
                    <Icon name="add" />
                    {t("add")}
                  </>
                )}
              </Styled.CardButton>
            )}
          </Styled.CardButtonContainer>
        </Styled.SolutionContainer>
      )}

      {showSolution === id && isDelete && (
        <Styled.SolutionContainer>
          <Styled.ErrorMessageContainer>
            <Icon name="warning sign" />
            <TranslationText id={error?.messageId} />
          </Styled.ErrorMessageContainer>

          <Styled.HowToResolveContainer>{t("deletelayerconfirmation")}</Styled.HowToResolveContainer>
          {error?.solutions?.map((e, index) => (
            <div key={index} style={{ marginTop: 2 }}>
              {(index === 0 ||
                (layerIndex > 0 && (index === 1 || index === 3)) ||
                (layerIndex + 1 < layerLength && index === 2)) && (
                <>
                  <Radio
                    checked={resolvingAction === resolving(e)}
                    name="radioGroup"
                    onChange={handleResolvingAction}
                    style={{ marginRight: 4 }}
                    value={resolving(e)}
                  />
                  <TranslationText id={e} />
                </>
              )}
            </div>
          ))}
          <Styled.CardButtonContainer>
            <Styled.CardButton
              basic
              icon
              onClick={e => {
                e.stopPropagation();
                onCancelClicked();
              }}
              size="mini">
              <Icon name="cancel" />
              {t("cancel")}
            </Styled.CardButton>
            <Styled.CardButton disabled={resolvingAction === null} icon negative onClick={sendDataToServer} size="mini">
              <Icon name="trash" />
              {t("confirm")}
            </Styled.CardButton>
          </Styled.CardButtonContainer>
        </Styled.SolutionContainer>
      )}
    </Styled.ErrorCard>
  );
};

export default LithologyLayersError;
