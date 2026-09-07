import { Dispatch, SetStateAction, useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { ApiError } from "../../api/errorClasses.ts";
import { formatBytes, isAbortError, progressRefreshIntervalMs, TransferOptions } from "../../api/transferProgress.ts";
import { theme } from "../../AppTheme.ts";
import { AlertContext } from "../alert/alertContext.tsx";
import { CancelButton, ExportButton } from "../buttons/buttons.tsx";
import { LoadingBackdrop } from "../loadingBackdrop.tsx";

export interface ExportItem {
  label: string;
  exportFunction: (options?: TransferOptions) => Promise<Response | void>;
}

interface ExportDialogProps {
  isExporting: boolean;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
  exportItems: ExportItem[];
}

export const ExportDialog = ({ isExporting, setIsExporting, exportItems }: ExportDialogProps) => {
  const { t } = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [bytesReceived, setBytesReceived] = useState<number | null>(null);
  const lastShownAt = useRef(0);
  const runningExport = useRef<AbortController | null>(null);
  const { showAlert } = useContext(AlertContext);

  const closeExportDialog = useCallback(() => {
    setIsExporting(false);
  }, [setIsExporting]);

  const hideProgress = useCallback(() => {
    setInProgress(false);
    setBytesReceived(null);
  }, []);

  /**
   * Gives up on the running export. The server aborts the export once the client is gone,
   * so this stops the transfer instead of only hiding it.
   */
  const cancelExport = useCallback(() => {
    runningExport.current?.abort();
    hideProgress();
  }, [hideProgress]);

  const handleExport = useCallback(
    async (exportFunction: (options?: TransferOptions) => Promise<Response | void>) => {
      setIsExporting(false);
      setInProgress(true);
      setBytesReceived(null);
      lastShownAt.current = 0;
      const abortController = new AbortController();
      runningExport.current = abortController;
      const startTime = Date.now();
      try {
        await exportFunction({
          signal: abortController.signal,
          onProgress: ({ loaded }) => {
            const now = Date.now();
            if (now - lastShownAt.current < progressRefreshIntervalMs) return; // refreshes at most once per second.
            lastShownAt.current = now;
            setBytesReceived(loaded);
          },
        });
      } catch (error) {
        // Aborted by user to it is not reported as a failure.
        if (isAbortError(error)) return;
        if (error instanceof ApiError) {
          showAlert(t(error.message), "error");
        } else {
          showAlert(t("errorDuringExport"), "error");
        }
      } finally {
        runningExport.current = null;
        if (!abortController.signal.aborted) {
          // Display spinner for at least 1 second to improve UX
          const endTime = Date.now();
          const elapsedTime = endTime - startTime;
          if (elapsedTime < 1000) {
            setTimeout(() => {
              hideProgress();
            }, 1000 - elapsedTime);
          } else {
            hideProgress();
          }
        }
      }
    },
    [hideProgress, setIsExporting, showAlert, t],
  );

  return (
    <>
      <Dialog open={isExporting}>
        <Stack sx={{ minWidth: "326px" }}>
          <DialogTitle>{t("export")}</DialogTitle>
          <DialogContent>
            <Stack gap={1} sx={{ mt: 3 }}>
              {exportItems.map(item => (
                <ExportButton
                  key={`export-${item.label}`}
                  label={item.label}
                  onClick={() => handleExport(item.exportFunction)}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <CancelButton onClick={closeExportDialog} />
            </Stack>
          </DialogActions>
        </Stack>
      </Dialog>
      {inProgress && (
        <LoadingBackdrop
          open={inProgress}
          onClick={cancelExport}
          sx={{ zIndex: theme.zIndex.modal }}
          message={bytesReceived === null ? t("preparingExport") : t("downloadingExport")}
          hint={
            bytesReceived === null ? t("clickToCancel") : t("exportProgressHint", { size: formatBytes(bytesReceived) })
          }
        />
      )}
    </>
  );
};
