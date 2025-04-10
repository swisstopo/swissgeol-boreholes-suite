import { FC, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import { Photo } from "../../../../api/apiInterfaces.ts";
import { deletePhotos, exportPhotos } from "../../../../api/fetchApiV2.ts";
import { DeleteButton, ExportButton } from "../../../../components/buttons/buttons.tsx";
import DateText from "../../../../components/legacyComponents/dateText.js";
import { Table } from "../../../../components/table/table.tsx";
import { TableSearchField } from "../../../../components/table/tableSearchField.tsx";
import { DetailContext } from "../../detailContext.tsx";

interface PhotosTableProps {
  photos: Photo[];
  loadPhotos: () => void;
}

export const PhotosTable: FC<PhotosTableProps> = ({ photos, loadPhotos }) => {
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const { editingEnabled } = useContext(DetailContext);
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

  const deleteSelected = async () => {
    await deletePhotos(selectionModel as number[]);
    loadPhotos();
  };

  const exportSelected = async () => {
    await exportPhotos(selectionModel as number[]);
  };

  return (
    <Box data-cy="photos-table-container">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          {editingEnabled && <DeleteButton disabled={selectionModel.length === 0} onClick={deleteSelected} />}
          <ExportButton disabled={selectionModel.length === 0} onClick={exportSelected} />
          <Typography>{selectionModel.length > 0 && t("selectedCount", { count: selectionModel.length })}</Typography>
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
