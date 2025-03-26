import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormControl } from "@mui/base";
import { FormControlLabel, IconButton, Radio, RadioGroup } from "@mui/material";
import { Check, TriangleAlert, Wrench } from "lucide-react";
import { deleteLayer, gapLayer } from "../../../../../../api-lib";
import { addBedrock, fetchLayerById } from "../../../../../../api/fetchApiV2.js";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import {
  AddButton,
  BoreholesBaseButton,
  CancelButton,
  DeleteButton,
} from "../../../../../../components/buttons/buttons.js";
import { DataCardButtonContainer } from "../../../../../../components/dataCard/dataCard.js";
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
  const handleResolvingAction = e => {
    e.stopPropagation();
    setResolvingAction(parseInt(e.target.value));
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
            <TriangleAlert />
            {t(error?.messageId)}
          </Styled.ErrorMessageContainer>

          {isEditable && showSolution !== id && (
            <IconButton sx={{ m: 2 }} color={"error"} onClick={() => setShowSolution(id)}>
              <Wrench />
            </IconButton>
          )}
        </Styled.Row>
      )}

      {showSolution === id && !isDelete && (
        <Styled.SolutionContainer>
          {error.id !== 5 && <Styled.HowToResolveContainer>{t("errorHowToResolve")}</Styled.HowToResolveContainer>}
          <FormControl>
            <RadioGroup value={resolvingAction} onChange={handleResolvingAction}>
              {error?.solutions?.map(
                e =>
                  error.solutions.length > 1 && (
                    <FormControlLabel key={e} value={resolving(e)} control={<Radio />} label={t(e)} />
                  ),
              )}
            </RadioGroup>
          </FormControl>
          <DataCardButtonContainer>
            <CancelButton onClick={onCancelClicked} />
            {error?.id !== 5 &&
              (error?.id !== 0 ? (
                <BoreholesBaseButton
                  variant={"outlined"}
                  color={"secondary"}
                  disabled={resolvingAction === null && error?.id !== 0}
                  onClick={sendDataToServer}
                  label="confirm"
                  icon={<Check />}
                />
              ) : (
                <AddButton disabled={resolvingAction === null && error?.id !== 0} onClick={sendDataToServer} />
              ))}
          </DataCardButtonContainer>
        </Styled.SolutionContainer>
      )}

      {showSolution === id && isDelete && (
        <Styled.SolutionContainer>
          <Styled.ErrorMessageContainer>
            <TriangleAlert />
            {t(error?.messageId)}
          </Styled.ErrorMessageContainer>
          <Styled.HowToResolveContainer>{t("deletelayerconfirmation")}</Styled.HowToResolveContainer>
          <FormControl>
            <RadioGroup value={resolvingAction} onChange={handleResolvingAction}>
              {error?.solutions?.map(
                (e, index) =>
                  (index === 0 ||
                    (layerIndex > 0 && (index === 1 || index === 3)) ||
                    (layerIndex + 1 < layerLength && index === 2)) && (
                    <FormControlLabel
                      key={e}
                      value={resolving(e)}
                      control={<Radio />}
                      label={t(e)}
                      style={{ marginTop: 2 }}
                    />
                  ),
              )}
            </RadioGroup>
          </FormControl>
          <DataCardButtonContainer>
            <CancelButton onClick={onCancelClicked} />
            <DeleteButton disabled={resolvingAction === null} onClick={sendDataToServer} />
          </DataCardButtonContainer>
        </Styled.SolutionContainer>
      )}
    </Styled.ErrorCard>
  );
};

export default LithologyLayersError;
