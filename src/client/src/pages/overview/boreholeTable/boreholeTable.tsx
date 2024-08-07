import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { TablePaginationActions } from "../TablePaginationActions.tsx";
import { FC, useMemo, useRef } from "react";
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

  const rowCountRef = useRef(boreholes?.length || 0);

  const rowCount = useMemo(() => {
    if (boreholes?.length > 0) {
      rowCountRef.current = boreholes.length;
    }
    return rowCountRef.current;
  }, [boreholes?.length]);

  console.log(rowCount);

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
      rowCount={rowCount}
      rows={boreholes.data}
      columns={columns}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[25, 50, 100]}
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
