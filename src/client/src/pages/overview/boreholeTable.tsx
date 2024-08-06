import { DataGrid } from "@mui/x-data-grid";
import { TablePaginationActions } from "./TablePaginationActions.tsx";
import { FC, useContext } from "react";
import { theme } from "../../AppTheme.ts";
import { useTranslation } from "react-i18next";
import { BoreholesContext } from "../boreholesContext.tsx";

export interface BoreholeTableProps {
  highlightRow: number | null;
  onHoverRow: (id: number | null) => void;
}

export const BoreholeTable: FC<BoreholeTableProps> = ({}: BoreholeTableProps) => {
  const { t } = useTranslation();
  const {
    isFetching,
    boreholeCount,
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    selectionModel,
    setSelectionModel,
    loadedBoreholes,
  } = useContext(BoreholesContext);

  const columns = [
    { field: "data.name", headerName: t("name"), flex: 1 },
    { field: "data.workgroup", headerName: t("workgroup"), flex: 1 },
    { field: "data.borehole_type", headerName: t("borehole_type"), flex: 1 },
    { field: "data.totaldepth", headerName: t("totaldepth"), flex: 1 },
    { field: "data.purpose", headerName: t("purpose"), flex: 1 },
    { field: "data.reference_elevation", headerName: t("reference_elevation"), flex: 1 },
    { field: "data.location", headerName: t("location"), flex: 1 },
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
      loading={isFetching}
      rowCount={boreholeCount}
      rows={loadedBoreholes}
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
