import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import { Photo } from "../../../../api/apiInterfaces.ts";
import { ExportButton } from "../../../../components/buttons/buttons.tsx";
import DateText from "../../../../components/legacyComponents/dateText.js";
import { Table } from "../../../../components/table/table.tsx";
import { TableSearchField } from "../../../../components/table/tableSearchField.tsx";

interface PhotosTableProps {
  photos: Photo[];
}

export const PhotosTable: FC<PhotosTableProps> = ({ photos }) => {
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const columns = useMemo<GridColDef<Photo>[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
      },
      {
        field: "created",
        headerName: t("uploaded"),
        renderCell: ({ row }) => <DateText date={row.created} hours />,
      },
      {
        field: "createdBy",
        headerName: t("dataProvider"),
        valueGetter: (value, row) => row.createdBy?.name ?? "-",
      },
      {
        field: "depth",
        headerName: t("depthMD"),
        valueGetter: (value, row) => `${row.fromDepth} - ${row.toDepth}`,
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
      },
    ],
    [t],
  );

  const exportSelected = () => {
    console.log("export", selectionModel);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ExportButton disabled={selectionModel.length === 0} onClick={exportSelected} />
          <Typography>{t("selectedCount", { count: selectionModel.length })}</Typography>
        </Stack>
        <Box>
          <TableSearchField apiRef={apiRef} />
        </Box>
      </Stack>
      <Table<Photo>
        apiRef={apiRef}
        rows={photos}
        columns={columns}
        showQuickFilter={false}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
      />
    </Box>
  );
};
