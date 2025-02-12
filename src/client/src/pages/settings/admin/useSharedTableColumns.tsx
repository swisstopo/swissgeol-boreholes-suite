import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import { theme } from "../../../AppTheme.ts";

export function useSharedTableColumns() {
  const { t } = useTranslation();
  const statusColumn: GridColDef = {
    field: "isDisabled",
    headerName: t("status"),
    valueGetter: isDisabled => {
      return isDisabled ? t("inactive") : t("active");
    },
    width: 120,
  };

  const getDeleteColumn = (handleDelete: (event: MouseEvent<HTMLButtonElement>, id: number) => void): GridColDef => {
    const renderDeleteCell = (params: GridRenderCellParams) => {
      return (
        <Button
          variant="outlined"
          key={params.row.id}
          data-cy={`delete-row-${params.row.id}`}
          onClick={event => handleDelete(event, params.row.id as number)}
          sx={{ p: 0.5 }}>
          <Trash2 color={theme.palette.primary.main} />
        </Button>
      );
    };

    return {
      field: "delete",
      headerName: "",
      width: 32,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableReorder: true,
      disableExport: true,
      renderCell: renderDeleteCell,
    };
  };

  return { statusColumn, getDeleteColumn };
}
