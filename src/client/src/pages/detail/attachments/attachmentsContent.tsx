import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { RefObject } from "@mui/x-internals/types";
import { Plus } from "lucide-react";
import { DeleteButton, ExportButton } from "../../../components/buttons/buttons.tsx";
import { Table } from "../../../components/table/table.tsx";
import { TableSearchField } from "../../../components/table/tableSearchField.tsx";
import { DetailContext } from "../detailContext.tsx";
import { AddAttachmentButton } from "./addAttachmentButton.tsx";

interface AttachmentContentProps<T extends GridValidRowModel> {
  apiRef: RefObject<GridApiCommunity>;
  isLoading: boolean;
  rows: T[] | undefined;
  columns: GridColDef<T>[];
  addAttachment: (file?: File) => Promise<void>;
  acceptedFileTypes?: string;
  requireFileOnAdd?: boolean;
  deleteAttachments: () => Promise<void>;
  exportAttachments?: () => Promise<void>;
  addAttachmentButtonLabel: string;
  noAttachmentsText: string;
}

export const AttachmentContent = <T extends GridValidRowModel>({
  apiRef,
  isLoading,
  rows,
  columns,
  addAttachment,
  acceptedFileTypes,
  requireFileOnAdd,
  deleteAttachments,
  exportAttachments,
  addAttachmentButtonLabel,
  noAttachmentsText,
}: AttachmentContentProps<T>) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  return (
    <>
      {editingEnabled &&
        (requireFileOnAdd ? (
          <AddAttachmentButton
            label={t(addAttachmentButtonLabel)}
            onFileSelect={addAttachment}
            acceptedFileTypes={acceptedFileTypes}
            dataCy={`${addAttachmentButtonLabel}-button`}
          />
        ) : (
          <Button
            variant="contained"
            endIcon={<Plus />}
            sx={{ position: "absolute", top: "0", right: "0", mx: 2, my: 1 }}
            onClick={() => addAttachment()}
            data-cy={`${addAttachmentButtonLabel}-button`}>
            {t(addAttachmentButtonLabel)}
          </Button>
        ))}
      {(rows && rows.length > 0) || isLoading ? (
        <Box data-cy="attachment-table-container">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              {editingEnabled && (
                <DeleteButton disabled={selectionModel.length === 0} onClick={() => deleteAttachments()} />
              )}
              {exportAttachments && (
                <ExportButton disabled={selectionModel.length === 0} onClick={() => exportAttachments()} />
              )}
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
              rows={rows ?? []}
              columns={columns}
              showQuickFilter={false}
              checkboxSelection
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={setSelectionModel}
              rowAutoHeight={true}
            />
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">{t(noAttachmentsText)}</Typography>
      )}
    </>
  );
};
