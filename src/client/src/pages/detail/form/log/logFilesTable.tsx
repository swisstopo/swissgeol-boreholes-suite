import { FC, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { GridColDef, GridRowId, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import { Table } from "../../../../components/table/table.tsx";
import { usePublicColumn } from "../../../../components/table/usePublicColumn.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { LogFile } from "./log.ts";

interface LogFileTableProps {
  files: LogFile[];
  isLoading: boolean;
}

export const LogFileTable: FC<LogFileTableProps> = ({ files, isLoading }) => {
  const { editingEnabled } = useContext(EditStateContext);
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, LogFile>>(new Map());
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const { getPublicColumnHeader, getPublicColumnCell } = usePublicColumn({
    apiRef,
    updatedRows,
    setUpdatedRows,
    rows: files,
  });

  const columns = useMemo<GridColDef<LogFile>[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        editable: editingEnabled,
        flex: 1,
        valueGetter: (value, row) => row?.name ?? "-",
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        editable: editingEnabled,
        resizable: false,
        width: editingEnabled ? 150 : 100,
        renderHeader: getPublicColumnHeader,
        renderCell: getPublicColumnCell,
      },
    ],
    [t, editingEnabled, getPublicColumnHeader, getPublicColumnCell],
  );
  if (files.length === 0) {
    return <Typography>{t("noLogFiles")}</Typography>;
  }

  return (
    <Table
      apiRef={apiRef}
      isLoading={isLoading}
      rows={files}
      columns={columns}
      showQuickFilter={false}
      checkboxSelection
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={setSelectionModel}
      rowAutoHeight={true}
    />
  );
};
