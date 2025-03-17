import { FC, MutableRefObject, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DataGrid,
  GridColDef,
  GridColumnResizeParams,
  GridEventListener,
  GridFilterModel,
  GridPaginationModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbar,
  useGridApiRef,
} from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { BoreholeAttributes } from "../../api-lib/ReduxStateInterfaces.ts";
import { User, Workgroup } from "../../api/apiInterfaces.ts";
import { muiLocales } from "../../mui.locales.ts";
import { TablePaginationActions } from "../../pages/overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "../../pages/settings/admin/quickfilterStyles.ts";

interface TableProps {
  rows: User[] | Workgroup[] | BoreholeAttributes[];
  columns: GridColDef[];
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  onRowClick?: GridEventListener<"rowClick">;
  getRowClassName?: (params: GridRowParams) => string;
  dataCy?: string;
  apiRef?: MutableRefObject<GridApiCommunity>;
  isLoading?: boolean;
  rowCount?: number;
  rowSelectionModel?: GridRowSelectionModel;
  paginationMode?: "server" | "client";
  sortingMode?: "server" | "client";
  checkboxSelection?: boolean;
  isRowSelectable?: (params: GridRowParams) => boolean;
  isDisabled?: boolean;
  showQuickFilter?: boolean;
  rowAutoHeight?: boolean;
}

export const Table: FC<TableProps> = ({
  rows,
  columns,
  filterModel,
  onFilterModelChange,
  sortModel,
  onSortModelChange,
  paginationModel,
  onPaginationModelChange,
  onRowClick,
  getRowClassName,
  dataCy,
  apiRef,
  isLoading,
  rowCount,
  rowSelectionModel,
  paginationMode = "client",
  sortingMode = "client",
  checkboxSelection = false,
  isRowSelectable,
  isDisabled = false,
  showQuickFilter = true,
  rowAutoHeight = false,
}) => {
  const { i18n } = useTranslation();
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const internalApiRef = useGridApiRef();
  const effectiveApiRef = apiRef ?? internalApiRef;

  // Ensure user-defined column widths are persisted when table re-renders
  useEffect(() => {
    if (effectiveApiRef.current) {
      Object.entries(columnWidths).forEach(([field, width]) => {
        effectiveApiRef.current.setColumnWidth(field, width);
      });
    }
  }, [apiRef, columnWidths, effectiveApiRef]);

  const handleColumnResize = useCallback(
    (params: GridColumnResizeParams) => {
      const updatedWidths = {
        ...columnWidths,
        [params.colDef.field]: params.width,
      };
      setColumnWidths(updatedWidths);
    },
    [columnWidths],
  );

  const disabledStyles = {
    cursor: isDisabled ? "default" : "pointer",
    "& .MuiDataGrid-row:hover": { backgroundColor: isDisabled && "rgba(0,0,0,0)" },
    "& .MuiDataGrid-columnHeader": { cursor: isDisabled ? "default" : "pointer" },
  };

  const defaultRowClassName = (params: GridRowParams): string => (params.row.isDisabled ? "disabled-row" : "");

  // Apply user-defined column widths to columns
  const adjustedWidthColumns = columns.map(col => {
    // If column is not resizable, no need to set width
    if (col.resizable === false) {
      return col;
    }

    return {
      ...col,
      width: columnWidths[col.field] || col.width,
      flex: columnWidths[col.field] ? undefined : 1, // Auto flex if no width
    };
  });

  return (
    <DataGrid
      sx={{ border: "none !important", ...quickFilterStyles, ...disabledStyles }}
      data-cy={dataCy || "data-table"}
      columnHeaderHeight={44}
      sortingOrder={["asc", "desc"]}
      loading={isLoading ?? !rows?.length}
      rowCount={paginationMode === "server" ? (rowCount ?? rows?.length) : undefined}
      rows={rows}
      columns={adjustedWidthColumns}
      getRowHeight={() => (rowAutoHeight ? "auto" : 44)}
      onRowClick={onRowClick}
      pageSizeOptions={[100]}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        pagination: {
          ActionsComponent: TablePaginationActions,
        },
        toolbar: {
          csvOptions: { disableToolbarButton: true },
          printOptions: { disableToolbarButton: true },
          showQuickFilter: showQuickFilter,
        },
      }}
      localeText={muiLocales[i18n.language]}
      disableColumnSelector
      disableRowSelectionOnClick
      hideFooterPagination={!rows?.length}
      hideFooterSelectedRowCount
      disableColumnFilter
      disableColumnMenu={true}
      disableDensitySelector
      filterModel={filterModel}
      getRowClassName={getRowClassName ?? defaultRowClassName}
      onFilterModelChange={onFilterModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      onColumnResize={handleColumnResize}
      apiRef={apiRef}
      paginationMode={paginationMode}
      sortingMode={sortingMode}
      checkboxSelection={checkboxSelection}
      isRowSelectable={isRowSelectable}
      rowSelectionModel={rowSelectionModel}
    />
  );
};
