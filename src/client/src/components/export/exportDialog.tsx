import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { exportCSVBorehole, getAllBoreholes } from "../../api/borehole.ts";
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
    const paginatedResponse = await getAllBoreholes(selectionModel, 1, selectionModel.length);
    const jsonString = JSON.stringify(paginatedResponse.boreholes, null, 2);
    downloadData(jsonString, `${fileName}.json`, "application/json");
    setIsExporting(false);
  };

  const exportCsv = async () => {
    const csvData = await exportCSVBorehole(selectionModel.slice(0, 100));
    downloadData(csvData, `${fileName}.json`, "text/csv");
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
