import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import { ApiError } from "../../api/apiInterfaces.ts";
import { exportCSVBorehole, exportJsonBoreholes, exportJsonWithAttachmentsBorehole } from "../../api/borehole.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
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
  const auth = useAuth();
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const canExportAttachments = !auth.anonymousModeEnabled && user.data.roles.includes("EDIT");
  const { showAlert } = useContext(AlertContext);

  const handleExport = async (exportFunction: (ids: number[] | GridRowSelectionModel) => Promise<Response | void>) => {
    try {
      await exportFunction(selectionModel.slice(0, 100));
    } catch (error) {
      if (error instanceof ApiError) {
        showAlert(t(error.message), "error");
      } else {
        showAlert(t("errorDuringExport"), "error");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const onExportJson = async () => {
    await handleExport(exportJson);
  };

  const onExportCsv = async () => {
    await handleExport(exportCsv);
  };

  const onExportJsonWithAttachments = async () => {
    await handleExport(exportJsonWithAttachmentsBorehole);
  };

  const exportJson = async () => {
    const exportJsonResponse = await exportJsonBoreholes(selectionModel);
    const jsonString = JSON.stringify(exportJsonResponse);
    downloadData(jsonString, `${fileName}.json`, "application/json");
  };

  const exportCsv = async () => {
    const csvData = await exportCSVBorehole(selectionModel.slice(0, 100));
    downloadData(csvData, `${fileName}.csv`, "text/csv");
  };

  return (
    <Dialog open={isExporting}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h2">{t("export")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={1} sx={{ mt: 3 }}>
            <ExportButton label={"CSV"} onClick={onExportCsv} />
            <ExportButton label={"JSON"} onClick={onExportJson} />
            {canExportAttachments && <ExportButton label={"JSON + PDF"} onClick={onExportJsonWithAttachments} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={() => setIsExporting(false)} />
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
