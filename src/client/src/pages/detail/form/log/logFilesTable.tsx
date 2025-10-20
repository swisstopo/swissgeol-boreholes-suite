import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { GridColDef, GridRowId, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import { useCodelists } from "../../../../components/codelist.ts";
import { Table } from "../../../../components/table/table.tsx";
import { usePublicColumn } from "../../../../components/table/usePublicColumn.tsx";
import { LogFile } from "./log.ts";

interface LogFileTableProps {
  files: LogFile[];
}

export const LogFileTable: FC<LogFileTableProps> = ({ files }) => {
  const { t, i18n } = useTranslation();
  const apiRef = useGridApiRef();
  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, LogFile>>(new Map());
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const { data: codelists } = useCodelists();

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
        flex: 1,
        valueGetter: (value, row) => row?.name ?? "-",
      },
      {
        field: "toolTypeCodelistIds",
        valueGetter: (values: number[] | undefined) =>
          values
            ?.map(value => {
              const code = codelists.find(code => code.id === value);
              return code?.code ?? "";
            })
            .join(", ") ?? "",
        headerName: t("toolType"),
        flex: 1,
      },
      {
        field: "fileType",
        headerName: t("extension"),
        flex: 1,
      },
      {
        field: "passTypeId",
        valueGetter: (value: number) => {
          const code = codelists.find(code => code.id === value);
          return code?.[i18n.language] ?? code?.["en"] ?? "";
        },
        headerName: t("passType"),
        flex: 1,
      },
      {
        field: "pass",
        headerName: t("pass"),
        flex: 1,
      },
      {
        field: "dataPackageId",
        valueGetter: (value: number) => {
          const code = codelists.find(code => code.id === value);
          return code?.[i18n.language] ?? code?.["en"] ?? "";
        },
        headerName: t("dataPackage"),
        flex: 1,
      },
      {
        field: "depthTypeId",
        valueGetter: (value: number) => {
          const code = codelists.find(code => code.id === value);
          return code?.[i18n.language] ?? code?.["en"] ?? "";
        },
        headerName: t("depthType"),
        flex: 1,
      },
      {
        field: "deliveryDate",
        valueGetter: (value: string) => (value && new Date(value).toLocaleDateString()) ?? "",
        headerName: t("deliveryDate"),
        flex: 1,
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        resizable: false,
        width: 100,
        renderHeader: getPublicColumnHeader,
        renderCell: getPublicColumnCell,
      },
    ],
    [t, getPublicColumnHeader, getPublicColumnCell, codelists, i18n.language],
  );
  if (files.length === 0) {
    return <Typography>{t("noLogFiles")}</Typography>;
  }

  return (
    <Table
      apiRef={apiRef}
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
