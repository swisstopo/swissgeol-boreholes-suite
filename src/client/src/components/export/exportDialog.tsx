import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ApiError } from "../../api/apiInterfaces.ts";
import { exportCSVBorehole, exportJsonBoreholes, exportJsonWithAttachmentsBorehole } from "../../api/borehole.ts";
import { theme } from "../../AppTheme.ts";
import { downloadData } from "../../utils.ts";
import { AlertContext } from "../alert/alertContext.tsx";
import { CancelButton, ExportButton } from "../buttons/buttons.tsx";

interface ExportDialogProps {
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
  selectionModel: GridRowSelectionModel;
  fileName: string;
}
export const ExportDialog = ({ isExporting, setIsExporting, selectionModel, fileName }: ExportDialogProps) => {
  const { t } = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const { showAlert } = useContext(AlertContext);

  const closeExportDialog = useCallback(() => {
    setInProgress(false);
    setIsExporting(false);
  }, [setIsExporting]);

  const handleExport = useCallback(
    async (exportFunction: (ids: number[] | GridRowSelectionModel) => Promise<Response | void>) => {
      setInProgress(true);
      const startTime = Date.now();
      try {
        await exportFunction(selectionModel.slice(0, 100));
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
    [closeExportDialog, selectionModel, showAlert, t],
  );

  const onExportJson = async () => {
    await handleExport(exportJson);
  };

  const onExportCsv = async () => {
    await handleExport(exportCsv);
  };

  const onExportJsonWithAttachments = async () => {
    await handleExport(exportJsonWithAttachmentsBorehole);
  };

  const exportJson = async (ids: number[] | GridRowSelectionModel) => {
    const exportJsonResponse = await exportJsonBoreholes(ids);
    const jsonString = JSON.stringify(exportJsonResponse);
    downloadData(jsonString, `${fileName}.json`, "application/json");
  };

  const exportCsv = async (ids: number[] | GridRowSelectionModel) => {
    const csvData = await exportCSVBorehole(ids);
    downloadData(csvData, `${fileName}.csv`, "text/csv");
  };

  return (
    <Dialog open={isExporting}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>{t("export")}</DialogTitle>
        <DialogContent>
          <Stack gap={1} sx={{ mt: 3 }}>
            <ExportButton label={"CSV"} onClick={onExportCsv} />
            <ExportButton label={"JSON"} onClick={onExportJson} />
            <ExportButton label={"JSON + PDF"} onClick={onExportJsonWithAttachments} />
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
