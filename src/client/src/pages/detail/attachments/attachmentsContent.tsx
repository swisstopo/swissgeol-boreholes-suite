import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { RefObject } from "@mui/x-internals/types";
import { DeleteButton, ExportButton } from "../../../components/buttons/buttons.tsx";
import { Table } from "../../../components/table/table.tsx";
import { TableSearchField } from "../../../components/table/tableSearchField.tsx";
import { DetailContext } from "../detailContext.tsx";
import { AddAttachmentButton } from "./addAttachmentButton.tsx";

interface AttachmentContentProps {
  apiRef: RefObject<GridApiCommunity>;
  isLoading: boolean;
  rows: GridValidRowModel[] | undefined;
  columns: GridColDef<GridValidRowModel>[];
  addAttachment: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  deleteAttachments: () => Promise<void>;
  exportAttachments: () => Promise<void>;
  addAttachmentButtonLabel: string;
  noAttachmentsText: string;
}

export const AttachmentContent: FC<AttachmentContentProps> = ({
  apiRef,
  isLoading,
  rows,
  columns,
  addAttachment,
  acceptedFileTypes,
  deleteAttachments,
  exportAttachments,
  addAttachmentButtonLabel,
  noAttachmentsText,
}) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  return (
    <>
      {editingEnabled && (
        <AddAttachmentButton
          label={t(addAttachmentButtonLabel)}
          onFileSelect={addAttachment}
          acceptedFileTypes={acceptedFileTypes}
          dataCy={`${addAttachmentButtonLabel}-button`}
        />
      )}
      {(rows && rows.length > 0) || isLoading ? (
        <Box data-cy="attachment-table-container">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              {editingEnabled && (
                <DeleteButton disabled={selectionModel.length === 0} onClick={() => deleteAttachments()} />
              )}
              <ExportButton
                disabled={selectionModel.length === 0}
                onClick={() => exportAttachments()}
                dataCy={"attachment-export-button"}
              />
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
            />
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">{t(noAttachmentsText)}</Typography>
      )}
    </>
  );
};
