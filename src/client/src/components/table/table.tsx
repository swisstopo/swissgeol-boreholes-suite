import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SxProps, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnResizeParams,
  GridEventListener,
  GridFilterModel,
  GridPaginationModel,
  GridRowIdGetter,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbar,
  GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { muiLocales } from "../../mui.locales.ts";
import { TablePaginationActions } from "../../pages/overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "../../pages/settings/admin/quickfilterStyles.ts";

interface TableProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef[];
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  onRowClick?: GridEventListener<"rowClick">;
  getRowClassName?: (params: GridRowParams<T>) => string;
  dataCy?: string;
  apiRef?: MutableRefObject<GridApiCommunity>;
  isLoading?: boolean;
  rowCount?: number;
  maxRowsPerPage?: number;
  rowSelectionModel?: GridRowSelectionModel;
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void;
  getRowId?: GridRowIdGetter<T>;
  isRowSelectable?: (params: GridRowParams<T>) => boolean;
  disableColumnSorting?: boolean;
  paginationMode?: "server" | "client";
  sortingMode?: "server" | "client";
  checkboxSelection?: boolean;
  isDisabled?: boolean;
  showQuickFilter?: boolean;
  rowAutoHeight?: boolean;
  noRowsLabel?: string;
  sx?: SxProps;
}

export const Table = <T extends GridValidRowModel>({
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
  maxRowsPerPage = 50,
  rowSelectionModel,
  onRowSelectionModelChange,
  getRowId,
  isRowSelectable,
  disableColumnSorting = false,
  paginationMode = "client",
  sortingMode = "client",
  checkboxSelection = false,
  isDisabled = false,
  showQuickFilter = true,
  rowAutoHeight = false,
  noRowsLabel,
  sx,
}: TableProps<T>) => {
  const { t, i18n } = useTranslation();
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const internalApiRef = useGridApiRef();
  const [internalPaginationModel, setInternalPaginationModel] = useState({
    pageSize: 50,
    page: 0,
  });
  const effectiveApiRef = apiRef ?? internalApiRef;

  // Ensure user-defined column widths are persisted when table re-renders
  useEffect(() => {
    if (effectiveApiRef?.current && Object.keys(effectiveApiRef.current).length > 0) {
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

  const defaultRowClassName = (params: GridRowParams<T>): string => (params.row.isDisabled ? "disabled-row" : "");

  // Apply user-defined column widths to columns
  const adjustedWidthColumns = columns.map(col => {
    // If column is not resizable, no need to set width
    if (col.resizable === false) {
      return col;
    }

    return {
      ...col,
      width: columnWidths[col.field] ?? col.width,
      flex: columnWidths[col.field] ? undefined : (col.flex ?? 1), // Auto flex if no width or flex
    };
  });

  const actualRowCount = paginationMode === "server" ? (rowCount ?? rows?.length) : rows.length;

  const loadingStyles = isLoading
    ? {
        "& .MuiDataGrid-overlay": {
          padding: "12px",
          alignItems: "flex-start",
        },
      }
    : {};

  const dataGridSx =
    rows.length === 0 && noRowsLabel
      ? {
          "--DataGrid-overlayHeight": "0px",
          "--height": "0px",
          ...quickFilterStyles,
          ...disabledStyles,
          ...sx,
          ...loadingStyles,
        }
      : {
          "--DataGrid-overlayHeight": "44px",
          ...quickFilterStyles,
          ...disabledStyles,
          ...sx,
          ...loadingStyles,
        };

  return (
    <>
      <DataGrid
        sx={dataGridSx}
        data-cy={dataCy ?? "data-table"}
        columnHeaderHeight={44}
        sortingOrder={["asc", "desc"]}
        loading={isLoading ?? !rows?.length}
        rowCount={actualRowCount}
        rows={rows}
        columns={adjustedWidthColumns}
        getRowHeight={() => (rowAutoHeight ? "auto" : 44)}
        onRowClick={onRowClick}
        pageSizeOptions={[maxRowsPerPage]}
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
        hideFooter={actualRowCount < maxRowsPerPage}
        hideFooterSelectedRowCount
        disableColumnFilter
        disableColumnMenu={true}
        disableDensitySelector
        filterModel={filterModel}
        getRowClassName={getRowClassName ?? defaultRowClassName}
        onFilterModelChange={onFilterModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        paginationModel={paginationModel ?? internalPaginationModel}
        onPaginationModelChange={onPaginationModelChange ?? setInternalPaginationModel}
        onColumnResize={handleColumnResize}
        apiRef={apiRef}
        paginationMode={paginationMode}
        sortingMode={sortingMode}
        checkboxSelection={checkboxSelection}
        disableColumnSorting={disableColumnSorting}
        isRowSelectable={isRowSelectable}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={onRowSelectionModelChange}
        getRowId={getRowId}
      />
      {rows.length === 0 && noRowsLabel && (
        <Typography pl={2} mt={1.5}>
          {t(noRowsLabel)}
        </Typography>
      )}
    </>
  );
};
