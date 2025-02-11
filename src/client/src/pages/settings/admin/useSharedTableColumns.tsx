import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import { theme } from "../../../AppTheme.ts";

export function useSharedTableColumns() {
  const { t } = useTranslation();
  const statusColumn: GridColDef = {
    field: "isDisabled",
    headerName: t("status"),
    valueGetter: isDisabled => {
      return isDisabled ? t("disabled") : t("enabled");
    },
    width: 120,
  };

  const deleteColumn: GridColDef = {
    field: "delete",
    headerName: "",
    width: 24,
    resizable: false,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    disableReorder: true,
    disableExport: true,
    renderCell: value => {
      return (
        <Stack
          direction={"row"}
          gap={1}
          p={0.5}
          key={value.id}
          sx={{ mt: 1, border: `1px solid ${theme.palette.primary.main}`, borderRadius: 1 }}>
          <Trash2 color={theme.palette.primary.main} />
        </Stack>
      );
    },
  };

  return { statusColumn, deleteColumn };
}
