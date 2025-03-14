import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Box, IconButton, TextField } from "@mui/material";
import { GridCellCheckboxRenderer, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Lock, LockOpen, Trash2 } from "lucide-react";
import { downloadFile } from "../../../../api/file/file";
import { BoreholeFile } from "../../../../api/file/fileInterfaces.ts";
import DateText from "../../../../components/legacyComponents/dateText.js";
import { Table } from "../../../../components/table/table.tsx";
import { DetailContext } from "../../detailContext.tsx";
import DownloadLink from "../downloadlink.jsx";

interface FilesTableProps {
  detachFile: (id: string, fid: number) => void;
  editor?: boolean;
  files: BoreholeFile[];
  patchFile: (
    id: string,
    fid: number,
    currentDescription: string,
    currentIsPublic: boolean,
    field: string,
    value: string | boolean,
  ) => void;
}

export const FilesTable: FC<FilesTableProps> = ({ editor, files, patchFile, detachFile }) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { editingEnabled } = useContext(DetailContext);

  const renderCellCheckbox = useCallback(
    (params: GridRenderCellParams) => {
      return (
        <Box p={1}>
          {editingEnabled ? (
            <GridCellCheckboxRenderer
              {...params}
              // @ts-expect-error onChange is not in the GridColumnHeaderParams type, but can be used
              onChange={e =>
                patchFile(id, params.row.fileId, params.row.description, params.row.public, "public", e.target.checked)
              }
            />
          ) : params.row.public ? (
            <IconButton color="success">
              <LockOpen />
            </IconButton>
          ) : (
            <IconButton color="error">
              <Lock />
            </IconButton>
          )}
        </Box>
      );
    },
    [editingEnabled, id, patchFile],
  );

  const columns: GridColDef[] = useMemo(() => {
    const cols: GridColDef[] = [];

    if (editor) {
      cols.push({
        field: "public",
        headerName: t("public"),
        width: 100,
        renderCell: renderCellCheckbox,
      });
    }

    cols.push(
      {
        field: "name",
        headerName: t("name"),
        flex: 1,
        minWidth: 150,
        maxWidth: 450,
        renderCell: ({ row }) => (
          <Box
            data-cy={`download-${row.file?.name}`}
            sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            <DownloadLink caption={row.file?.name} onDownload={() => downloadFile(row.fileId)} />
          </Box>
        ),
      },
      {
        field: "description",
        headerName: t("description"),
        minWidth: 170,
        flex: 1,
        renderCell: ({ row }) => {
          return editingEnabled ? (
            <Box sx={{ width: "100%", p: 1 }}>
              <TextField
                data-cy={`input-${row.file?.name}`}
                sx={{ width: "100%", m: 0 }}
                size="small"
                onKeyDown={event => {
                  event.stopPropagation(); // Allows to type spaces into the text field inside a data grid, which is prevented by default for accessibility reasons see: https://mui.com/x/react-data-grid/accessibility/#keyboard-navigation
                }}
                value={row.description}
                onChange={e => {
                  patchFile(id, row.fileId, row.description, row.public, "description", e.target.value);
                }}
              />
            </Box>
          ) : (
            <Box sx={{ width: "100%", p: 2 }}>{row.description}</Box>
          );
        },
      },
      {
        field: "type",
        headerName: t("type"),
        width: 150,
        valueGetter: (value, row) => row.file.type,
      },
      {
        field: "uploaded",
        headerName: t("uploaded"),
        width: 200,
        renderCell: ({ row }) => (
          <Box>
            <DateText date={row.attached} hours />
            <br />
            <span style={{ color: "#787878" }}>{row.user?.name}</span>
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "",
        width: 100,
        sortable: false,
        renderCell: ({ row }) => (
          <IconButton
            sx={{ visibility: editingEnabled ? "visible" : "hidden" }}
            data-cy="attachments-detach-button"
            onClick={e => {
              e.stopPropagation();
              detachFile(id, row.fileId);
            }}
            color="error">
            <Trash2 />
          </IconButton>
        ),
      },
    );

    return cols;
  }, [editor, t, editingEnabled, renderCellCheckbox, patchFile, id, detachFile]);

  return (
    <Table
      rows={files}
      columns={columns}
      rowAutoHeight={true}
      showQuickFilter={false}
      disableColumnSorting={true}
      getRowId={row => row.fileId}
    />
  );
};
