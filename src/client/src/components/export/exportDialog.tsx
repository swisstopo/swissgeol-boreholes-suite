import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { exportCSVBorehole, exportJsonBoreholes, exportJsonWithAttachmentsBorehole } from "../../api/borehole.ts";
import { downloadData } from "../../utils.ts";
import { CancelButton, ExportButton } from "../buttons/buttons.tsx";

interface ExportDialogProps {
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
  selectionModel: GridRowSelectionModel;
  fileName: string;
}
export const ExportDialog = ({ isExporting, setIsExporting, selectionModel, fileName }: ExportDialogProps) => {
  const { t } = useTranslation();

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

  return (
    <Dialog open={isExporting}>
      <Stack sx={{ minWidth: "326px" }}>
        <DialogTitle>
          <Typography variant="h2">{t("export")}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={1} sx={{ mt: 3 }}>
            <ExportButton label={"JSON"} onClick={exportJson} />
            <ExportButton label={"ZIP"} onClick={exportJsonWithAttachments} />
            <ExportButton label={"CSV"} onClick={exportCsv} />
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
