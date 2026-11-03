import { FC, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor, Box } from "@mui/material";
import {
  extractCoordinates,
  extractText,
  useExtractionBoundingBoxes,
  useFileInfo,
} from "../../../api/dataextraction.ts";
import {
  ExtractionObject,
  ExtractionRequest,
  ExtractionState,
  ExtractionType,
} from "../../../api/dataextractionInterfaces.ts";
import { OcrStatus } from "../../../api/generated";
import {
  isOcrTextAvailable,
  ocrStatusIsTerminal,
  useProfileImage,
  useProfileOcrStatusOf,
} from "../../../api/profile.ts";
import { BoreholeAttachment } from "../../../api/unionTypes.ts";
import { theme } from "../../../AppTheme.ts";
import { TextExtractionButton } from "../../../components/buttons/labelingButtons.tsx";
import { LoadingBackdrop } from "../../../components/loadingBackdrop.tsx";
import { useRequiredId } from "../../../hooks/useRequiredId.ts";
import { useShowAlertOnError } from "../../../hooks/useShowAlertOnError.tsx";
import { useLabelingContext } from "./labelingContext.tsx";
import { LabelingDrawContainer } from "./labelingDrawContainer.tsx";

interface LabelingExtractionProps {
  selectedFile: BoreholeAttachment | undefined;
  activePage: number;
  showAlert: (text: string, severity?: AlertColor, allowAutoHide?: boolean) => void;
  closeAlert: () => void;
}

const drawTooltipLabels: Partial<Record<ExtractionType, string>> = {
  coordinates: "drawCoordinateBox",
  text: "drawTextBox",
};

// Explains why the profile's text cannot be extracted yet or at all, or undefined when it can.
const getOcrMessageKey = (ocrStatus: OcrStatus | undefined, isStatusUnavailable: boolean): string | undefined => {
  if (isStatusUnavailable) return "pageTextCouldNotBeLoaded";
  if (ocrStatus === "Error") return "msgLabelingOcrFailed";
  if (!ocrStatusIsTerminal(ocrStatus)) return "msgLabelingWaitingForOcr";
  return undefined;
};

const getDrawTooltipLabel = (
  extractionState: ExtractionState | undefined,
  extractionObject: ExtractionObject | undefined,
): string | undefined => {
  const isDrawing = extractionState === ExtractionState.start || extractionState === ExtractionState.drawing;
  if (!isDrawing || !extractionObject?.type) return undefined;
  return drawTooltipLabels[extractionObject.type];
};

export const LabelingExtraction: FC<LabelingExtractionProps> = ({
  selectedFile,
  activePage,
  showAlert,
  closeAlert,
}) => {
  const { t } = useTranslation();
  const { extractionObject, setExtractionObject, setExtractionState, extractionState, setAbortController } =
    useLabelingContext();
  const drawTooltipLabel = getDrawTooltipLabel(extractionState, extractionObject);
  const boreholeId = useRequiredId();
  const { ocrStatus, isStatusUnavailable } = useProfileOcrStatusOf(boreholeId, selectedFile?.id);
  const isTextAvailable = isOcrTextAvailable(ocrStatus);
  const { data: fileInfo, isError: isFileInfoError, error: fileInfoError } = useFileInfo(selectedFile?.id, activePage);
  const { data: image, isError: isProfileInfoError, error: profileError } = useProfileImage(fileInfo?.fileName);
  const {
    data: pageBoundingBoxes,
    isPending: areBoundingBoxesPending,
    isError: isBoundingBoxesError,
    error: boundingBoxesError,
  } = useExtractionBoundingBoxes(selectedFile?.nameUuid, fileInfo, activePage, isTextAvailable);
  useShowAlertOnError(isBoundingBoxesError, boundingBoxesError, "warning");
  useShowAlertOnError(isFileInfoError, fileInfoError);
  useShowAlertOnError(isProfileInfoError, profileError);

  // The bounding boxes are only requested once the file's text is available, so the page does not wait for them before.
  const areBoundingBoxesLoading = isTextAvailable && areBoundingBoxesPending;
  const isPageSelectable = !!fileInfo && !!image && !areBoundingBoxesLoading;
  const hasPageFailedToLoad = isFileInfoError || isProfileInfoError;
  const isPageLoading = !isPageSelectable && !hasPageFailedToLoad;
  const hasPageText = (pageBoundingBoxes?.bounding_boxes.length ?? 0) > 0;
  const canExtractText = isPageSelectable && hasPageText;
  const missingPageTextKey = isBoundingBoxesError ? "pageTextCouldNotBeLoaded" : "noTextRecognizedOnPage";
  const textExtractionDisabledReason =
    isPageSelectable && !hasPageText
      ? t(getOcrMessageKey(ocrStatus, isStatusUnavailable) ?? missingPageTextKey)
      : undefined;

  const setTextToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        const successText = `${t("copiedToClipboard")}: "${text}"`;
        showAlert(successText.length < 50 ? successText : successText.substring(0, 50) + "...", "info");
      } catch {
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
        const request: ExtractionRequest = {
          filename: fileInfo.fileName.substring(0, fileInfo.fileName.lastIndexOf("-")) + ".pdf",
          page_number: activePage,
          bbox: bbox,
          format: extractionObject.type,
        };
        setExtractionState(ExtractionState.loading);
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
              // Not awaited: setTextToClipboard reports its own failures via an alert.
              void setTextToClipboard(response.text);
            }
          })
          .catch((error: unknown) => {
            if (!String(error).includes("AbortError")) {
              setExtractionState(ExtractionState.error);
              showAlert(t(error instanceof Error ? error.message : String(error)), "error");
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

  // The draw container registers its draw end listener once per map, so it gets a stable callback
  // that always runs the latest extraction.
  const triggerDataExtractionRef = useRef(triggerDataExtraction);
  useEffect(() => {
    triggerDataExtractionRef.current = triggerDataExtraction;
  });
  const handleDrawEnd = useCallback((extent: number[]) => triggerDataExtractionRef.current(extent), []);

  useEffect(() => {
    if (extractionState === ExtractionState.start) {
      closeAlert();
      setExtractionState(ExtractionState.drawing);
    }
  }, [closeAlert, extractionObject, extractionState, setExtractionObject, setExtractionState]);

  return (
    <>
      {isPageLoading && <LoadingBackdrop open={isPageLoading} sx={{ position: "absolute" }} />}
      <Box
        sx={{
          position: "absolute",
          top: theme.spacing(2),
          left: theme.spacing(2),
          zIndex: "500",
        }}>
        <TextExtractionButton
          disabled={
            !canExtractText || (extractionObject?.type == "text" && extractionState === ExtractionState.drawing)
          }
          disabledReason={textExtractionDisabledReason}
          onClick={() => {
            setExtractionObject({ type: "text" });
            setExtractionState(ExtractionState.start);
          }}
        />
      </Box>
      <LabelingDrawContainer
        fileInfo={fileInfo}
        onDrawEnd={handleDrawEnd}
        drawTooltipLabel={drawTooltipLabel}
        boundingBoxes={pageBoundingBoxes?.bounding_boxes}
        extractionType={extractionObject?.type}
      />
    </>
  );
};
