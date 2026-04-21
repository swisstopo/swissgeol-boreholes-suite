import { Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { ApiError } from "../../api/apiInterfaces.ts";
import { theme } from "../../AppTheme.ts";
import { AlertContext } from "../alert/alertContext.tsx";
import { CancelButton, ExportButton } from "../buttons/buttons.tsx";

export interface ExportItem {
  label: string;
  exportFunction: () => Promise<Response | void>;
}

interface ExportDialogProps {
  isExporting: boolean;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
  exportItems: ExportItem[];
}

export const ExportDialog = ({ isExporting, setIsExporting, exportItems }: ExportDialogProps) => {
  const { t } = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const { showAlert } = useContext(AlertContext);

  const closeExportDialog = useCallback(() => {
    setInProgress(false);
    setIsExporting(false);
  }, [setIsExporting]);

  const handleExport = useCallback(
    async (exportFunction: () => Promise<Response | void>) => {
      setInProgress(true);
      const startTime = Date.now();
      try {
        await exportFunction();
      } catch (error) {
        if (error instanceof ApiError) {
          showAlert(t(error.message), "error");
        } else {
          showAlert(t("errorDuringExport"), "error");
        }
      } finally {
        // Display spinner for at least 1 second to improve UX
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        if (elapsedTime < 1000) {
          setTimeout(() => {
            closeExportDialog();
          }, 1000 - elapsedTime);
        } else {
          closeExportDialog();
        }
      }
    },
    [closeExportDialog, showAlert, t],
  );

  return (
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
      {inProgress && (
        <Backdrop
          sx={{ color: theme.palette.primary.main, backgroundColor: theme.palette.background.backdrop }}
          open={inProgress}
          onClick={closeExportDialog}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Dialog>
  );
};
