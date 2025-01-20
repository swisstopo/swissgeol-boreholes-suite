import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ReduxRootState, User } from "../../api-lib/ReduxStateInterfaces.ts";
import {
  exportCSVBorehole,
  exportGeoPackageBoreholes,
  exportJsonBoreholes,
  exportJsonWithAttachmentsBorehole,
} from "../../api/borehole.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import { downloadData, downloadDataFromBlob } from "../../utils.ts";
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

  const exportJson = async () => {
    const exportJsonResponse = await exportJsonBoreholes(selectionModel);
    const jsonString = JSON.stringify(exportJsonResponse);
    downloadData(jsonString, `${fileName}.json`, "application/json");
    setIsExporting(false);
  };

  const exportCsv = async () => {
    const csvData = await exportCSVBorehole(selectionModel.slice(0, 100));
    downloadData(csvData, `${fileName}.csv`, "text/csv");
    setIsExporting(false);
  };

  const exportJsonWithAttachments = async () => {
    await exportJsonWithAttachmentsBorehole(selectionModel.slice(0, 100));
    setIsExporting(false);
  };

  const exportGeoPackage = async () => {
    const blob = await exportGeoPackageBoreholes(selectionModel.slice(0, 100));
    downloadDataFromBlob(blob, `${fileName}.gpkg`);
    setIsExporting(false);
  };

  return (
    <Dialog open={isExporting}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h2">{t("export")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={1} sx={{ mt: 3 }}>
            <ExportButton label={"CSV"} onClick={exportCsv} />
            <ExportButton label={"JSON"} onClick={exportJson} />
            {canExportAttachments && <ExportButton label={"JSON + PDF"} onClick={exportJsonWithAttachments} />}
            <ExportButton label={"GPKG"} onClick={exportGeoPackage} />
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
