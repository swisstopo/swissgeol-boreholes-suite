import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor, Box } from "@mui/material";
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
import { LoadingBackdrop } from "../../../components/loadingBackdrop.tsx";
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
  const { data: fileInfo, isError: isFileInfoError, error: fileInfoError } = useFileInfo(selectedFile?.id, activePage);
  const { data: image, isError: isProfileInfoError, error: profileError } = useProfileImage(fileInfo?.fileName);
  const {
    data: pageBoundingBoxes,
    isPending: areBoundingBoxesPending,
    isError: isBoundingBoxesError,
    error: boundingBoxesError,
  } = useExtractionBoundingBoxes(selectedFile?.nameUuid, fileInfo, activePage);
  useShowAlertOnError(isBoundingBoxesError, boundingBoxesError, "warning");
  useShowAlertOnError(isFileInfoError, fileInfoError);
  useShowAlertOnError(isProfileInfoError, profileError);

  const isPageSelectable = !!fileInfo && !!image && !areBoundingBoxesPending;
  const hasPageFailedToLoad = isFileInfoError || isProfileInfoError;
  const isPageLoading = !isPageSelectable && !hasPageFailedToLoad;
  const hasPageText = (pageBoundingBoxes?.bounding_boxes.length ?? 0) > 0;
  const canExtractText = isPageSelectable && hasPageText;
  const missingPageTextKey = isBoundingBoxesError ? "pageTextCouldNotBeLoaded" : "noTextRecognizedOnPage";
  const textExtractionDisabledReason = isPageSelectable && !hasPageText ? t(missingPageTextKey) : undefined;

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
              // Not awaited: setTextToClipboard reports its own failures via an alert.
              void setTextToClipboard(response.text);
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
