import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import { theme } from "../../../AppTheme.ts";

export function useSharedTableColumns() {
  const { t } = useTranslation();

  const firstNameColumn: GridColDef = { field: "firstName", headerName: t("firstname"), flex: 1 };
  const lastNameColumn: GridColDef = { field: "lastName", headerName: t("lastname"), flex: 1 };
  const emailColumn: GridColDef = { field: "email", headerName: "Email", flex: 1 };

  const workgroupNameColumn: GridColDef = {
    field: "name",
    headerName: t("workgroup"),
    flex: 1,
  };

  const boreholeCountColumn: GridColDef = {
    field: "boreholeCount",
    headerName: t("boreholeCount"),
    width: 200,
  };

  const statusColumn: GridColDef = {
    field: "isDisabled",
    headerName: t("status"),
    valueGetter: isDisabled => {
      return isDisabled ? t("inactive") : t("active");
    },
    width: 120,
  };

  const getDeleteColumn = (
    handleDelete: (event: MouseEvent<HTMLButtonElement>, id: number) => void,
    isDisabled: boolean = false,
  ): GridColDef => {
    const renderDeleteCell = (params: GridRenderCellParams) => {
      return (
        <Button
          variant="outlined"
          key={params.row.id}
          disabled={isDisabled}
          data-cy={`delete-id-${params.row.id}`}
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

  return {
    firstNameColumn,
    lastNameColumn,
    emailColumn,
    workgroupNameColumn,
    boreholeCountColumn,
    statusColumn,
    getDeleteColumn,
  };
}
