import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowSelectionModel, GridValidRowModel, useGridApiRef } from "@mui/x-data-grid";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { DeleteButton, ExportButton } from "../../../components/buttons/buttons.tsx";
import { Table } from "../../../components/table/table.tsx";
import { TableSearchField } from "../../../components/table/tableSearchField.tsx";
import { DetailContext } from "../detailContext.tsx";
import { AddAttachmentButton } from "./addAttachmentButton.tsx";

interface AttachmentContentProps {
  columns: GridColDef<GridValidRowModel>[];
  addAttachment: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  getAttachments: () => Promise<GridValidRowModel[]>;
  deleteAttachments: (ids: number[]) => Promise<void>;
  exportAttachments: (ids: number[]) => Promise<void>;
  addAttachmentButtonLabel: string;
  noAttachmentsText: string;
}

export const AttachmentContent: FC<AttachmentContentProps> = ({
  columns,
  addAttachment,
  acceptedFileTypes,
  getAttachments,
  deleteAttachments,
  exportAttachments,
  addAttachmentButtonLabel,
  noAttachmentsText,
}) => {
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const { editingEnabled } = useContext(DetailContext);
  const { showAlert } = useContext(AlertContext);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [rows, setRows] = useState<GridValidRowModel[]>();
  const [isLoading, setIsLoading] = useState(false);

  const loadAttachments = useCallback(async () => {
    setIsLoading(true);
    const attachments = await getAttachments();
    setRows(attachments);
    setIsLoading(false);
  }, [getAttachments]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const addSelected = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        await addAttachment(file);
        loadAttachments();
      } catch (error) {
        showAlert(t((error as Error).message), "error");
        setIsLoading(false);
      }
    },
    [addAttachment, loadAttachments, showAlert, t],
  );

  const deleteSelected = useCallback(async () => {
    setIsLoading(true);
    await deleteAttachments(selectionModel as number[]);
    loadAttachments();
  }, [deleteAttachments, loadAttachments, selectionModel]);

  const exportSelected = useCallback(async () => {
    await exportAttachments(selectionModel as number[]);
  }, [exportAttachments, selectionModel]);

  return (
    <>
      {editingEnabled && (
        <AddAttachmentButton
          label={t(addAttachmentButtonLabel)}
          onFileSelect={addSelected}
          acceptedFileTypes={acceptedFileTypes}
          dataCy={`${addAttachmentButtonLabel}-button`}
        />
      )}
      {rows && rows.length > 0 ? (
        <Box data-cy="attachment-table-container">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              {editingEnabled && <DeleteButton disabled={selectionModel.length === 0} onClick={deleteSelected} />}
              <ExportButton disabled={selectionModel.length === 0} onClick={exportSelected} />
              <Typography>
                {selectionModel.length > 0 && t("selectedCount", { count: selectionModel.length })}
              </Typography>
            </Stack>
            <Box>
              <TableSearchField apiRef={apiRef} />
            </Box>
          </Stack>
          <Box>
            <Table
              apiRef={apiRef}
              isLoading={isLoading}
              rows={rows}
              columns={columns}
              showQuickFilter={false}
              checkboxSelection
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={setSelectionModel}
            />
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">{t(noAttachmentsText)}</Typography>
      )}
    </>
  );
};
