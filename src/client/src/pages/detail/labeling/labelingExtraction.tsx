import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor, Box, CircularProgress } from "@mui/material";
import {
  extractCoordinates,
  extractText,
  useExtractionBoundingBoxes,
  useFileInfo,
} from "../../../api/dataextraction.ts";
import { ExtractionRequest, ExtractionState } from "../../../api/dataextractionInterfaces.ts";
import { useProfileImage } from "../../../api/profile.ts";
import { BoreholeAttachment } from "../../../api/unionTypes.ts";
import { theme } from "../../../AppTheme.ts";
import { TextExtractionButton } from "../../../components/buttons/labelingButtons.tsx";
import { useShowAlertOnError } from "../../../hooks/useShowAlertOnError.tsx";
import { useLabelingContext } from "./labelingContext.tsx";
import { LabelingDrawContainer } from "./labelingDrawContainer.tsx";

interface LabelingExtractionProps {
  selectedFile: BoreholeAttachment | undefined;
  activePage: number;
  showAlert: (text: string, severity?: AlertColor, allowAutoHide?: boolean) => void;
  closeAlert: () => void;
}

export const LabelingExtraction: FC<LabelingExtractionProps> = ({
  selectedFile,
  activePage,
  showAlert,
  closeAlert,
}) => {
  const { t } = useTranslation();
  const { extractionObject, setExtractionObject, setExtractionState, extractionState, setAbortController } =
    useLabelingContext();
  const [extractionExtent, setExtractionExtent] = useState<number[]>([]);
  const [drawTooltipLabel, setDrawTooltipLabel] = useState<string>();
  const { data: fileInfo } = useFileInfo(selectedFile?.id, activePage);
  const { data: image } = useProfileImage(fileInfo?.fileName);
  const {
    data: pageBoundingBoxes,
    isPending: areBoundingBoxesPending,
    isError,
    error,
  } = useExtractionBoundingBoxes(selectedFile?.nameUuid, fileInfo, activePage);
  useShowAlertOnError(isError, error, "warning");

  const isPageSelectable = !!fileInfo && !!image && !areBoundingBoxesPending;

  const setTextToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        const successText = `${t("copiedToClipboard")}: "${text}"`;
        showAlert(successText.length < 50 ? successText : successText.substring(0, 50) + "...", "info");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        showAlert(t("errorCopyingToClipboard"), "error");
      }
    },
    [showAlert, t],
  );

  const triggerDataExtraction = useCallback(
    (extent: number[]) => {
      if (fileInfo && extractionObject?.type) {
        const bbox = {
          x0: Math.min(extent[0], extent[2]),
          y0: Math.min(extent[1], extent[3]),
          x1: Math.max(extent[0], extent[2]),
          y1: Math.max(extent[1], extent[3]),
        };
        setExtractionExtent([]);
        const request: ExtractionRequest = {
          filename: fileInfo.fileName.substring(0, fileInfo.fileName.lastIndexOf("-")) + ".pdf",
          page_number: activePage,
          bbox: bbox,
          format: extractionObject.type,
        };
        setExtractionState(ExtractionState.loading);
        setDrawTooltipLabel(undefined);
        const abortController = new AbortController();
        setAbortController(abortController);
        const extractFunction = extractionObject.type === "coordinates" ? extractCoordinates : extractText;
        extractFunction(request, abortController.signal)
          .then(response => {
            if (extractionObject.type) {
              setExtractionState(ExtractionState.success);
              setExtractionObject({
                ...extractionObject,
                value: response[extractionObject.type],
              });
            }
            if (extractionObject.type === "text") {
              setTextToClipboard(response[extractionObject.type].toString());
            }
          })
          .catch(error => {
            if (!error?.toString().includes("AbortError")) {
              setExtractionState(ExtractionState.error);
              showAlert(t(error.message), "error");
            }
          })
          .finally(() => {
            setAbortController(undefined);
          });
      }
    },
    [
      activePage,
      extractionObject,
      fileInfo,
      setAbortController,
      setExtractionObject,
      setExtractionState,
      setTextToClipboard,
      showAlert,
      t,
    ],
  );

  useEffect(() => {
    if (extractionExtent?.length > 0) {
      triggerDataExtraction(extractionExtent);
    }
  }, [extractionExtent, triggerDataExtraction]);

  useEffect(() => {
    if (extractionState === ExtractionState.start) {
      closeAlert();
      setExtractionState(ExtractionState.drawing);
      if (extractionObject?.type === "coordinates") {
        setDrawTooltipLabel("drawCoordinateBox");
      }
    }
  }, [closeAlert, extractionObject, extractionState, setExtractionObject, setExtractionState]);

  return (
    <>
      {!isPageSelectable && (
        <Box
          data-cy="labeling-page-loading"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "400",
          }}>
          <CircularProgress />
        </Box>
      )}
      <Box
        sx={{
          position: "absolute",
          top: theme.spacing(2),
          left: theme.spacing(2),
          zIndex: "500",
        }}>
        <TextExtractionButton
          disabled={
            !isPageSelectable || (extractionObject?.type == "text" && extractionState === ExtractionState.drawing)
          }
          onClick={() => {
            setExtractionObject({ type: "text" });
            setExtractionState(ExtractionState.start);
            setDrawTooltipLabel("drawTextBox");
          }}
        />
      </Box>
      <LabelingDrawContainer
        fileInfo={fileInfo}
        onDrawEnd={setExtractionExtent}
        drawTooltipLabel={drawTooltipLabel}
        boundingBoxes={pageBoundingBoxes?.bounding_boxes}
        extractionType={extractionObject?.type}
      />
    </>
  );
};
