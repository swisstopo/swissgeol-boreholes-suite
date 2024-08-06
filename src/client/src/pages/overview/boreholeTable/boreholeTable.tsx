import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { TablePaginationActions } from "../TablePaginationActions.tsx";
import { FC } from "react";
import { theme } from "../../../AppTheme.ts";
import { useTranslation } from "react-i18next";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";

export interface BoreholeTableProps {
  highlightRow: number | null;
  onHoverRow: (id: number | null) => void;
  boreholes: Boreholes;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (model: GridRowSelectionModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
}

export const BoreholeTable: FC<BoreholeTableProps> = ({
  boreholes,
  paginationModel,
  setPaginationModel,
  selectionModel,
  setSelectionModel,
  sortModel,
  setSortModel,
}: BoreholeTableProps) => {
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    { field: "original_name", headerName: t("name"), flex: 1 },
    {
      field: "workgroup",
      valueGetter: (value: { name: string }) => {
        return value.name;
      },
      headerName: t("workgroup"),
      flex: 1,
    },
    { field: "borehole_type", headerName: t("borehole_type"), flex: 1 },
    {
      field: "total_depth",
      valueGetter: value => {
        return Math.round(value * 100) / 100;
      },
      headerName: t("totaldepth"),
      flex: 1,
    },
    {
      field: "extended",
      valueGetter: (value: { purpose: string }) => {
        return value.purpose;
      },
      headerName: t("purpose"),
      flex: 1,
    },
    {
      field: "reference_elevation",
      valueGetter: value => {
        return Math.round(value * 100) / 100;
      },
      headerName: t("reference_elevation"),
      flex: 1,
    },
    {
      field: "location",
      valueGetter: (value, row) => {
        return row.location_x + " / " + row.location_y;
      },
      headerName: t("location"),
      flex: 1,
    },
  ];

  return (
    <DataGrid
      sx={{
        ".MuiDataGrid-columnHeader": {
          backgroundColor: theme.palette.background.lightgrey,
        },
        ".MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus": {
          outline: "none",
        },
        ".MuiTablePagination-toolbar p": {
          margin: 0,
        },
        ".MuiDataGrid-footerContainer": {
          minHeight: "42px !important",
        },
      }}
      columnHeaderHeight={42}
      rowHeight={42}
      loading={boreholes.isFetching}
      rowCount={boreholes.length}
      rows={boreholes.data}
      columns={columns}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[100]}
      slotProps={{
        pagination: {
          ActionsComponent: TablePaginationActions,
        },
      }}
      disableColumnSelector
      disableColumnFilter
      checkboxSelection
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={setSelectionModel}
      hideFooterSelectedRowCount
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={setSortModel}
    />
  );
};
