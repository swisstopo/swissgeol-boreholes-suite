import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Stack, Typography } from "@mui/material";
import { GridColumnHeaderParams, GridRenderCellParams, GridRowId, GridValidRowModel } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { RefObject } from "@mui/x-internals/types";
import { CheckIcon } from "lucide-react";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { DetailContext } from "../detailContext.tsx";
import { SaveContext, SaveContextProps } from "../saveContext.tsx";

export interface AttachmentWithPublicState {
  public: boolean | undefined;
}

interface UseAttachmentsProps {
  apiRef: RefObject<GridApiCommunity>;
  loadAttachments: () => Promise<GridValidRowModel[]>;
  addAttachment: (file: File) => Promise<void>;
  updateAttachments: (updatedRows: Map<GridRowId, AttachmentWithPublicState>) => Promise<void>;
  deleteAttachments: (ids: number[]) => Promise<void>;
  exportAttachments: (ids: number[]) => Promise<void>;
}

export const useAttachments = ({
  apiRef,
  loadAttachments,
  addAttachment,
  updateAttachments,
  deleteAttachments,
  exportAttachments,
}: UseAttachmentsProps) => {
  const { t } = useTranslation();
  const { editingEnabled, reloadBorehole } = useContext(DetailContext);
  const { registerSaveHandler, registerResetHandler, unMount, markAsChanged } =
    useContext<SaveContextProps>(SaveContext);
  const { showAlert } = useContext(AlertContext);

  const [rows, setRows] = useState<GridValidRowModel[]>();
  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, AttachmentWithPublicState>>(new Map());
  const [allPublic, setAllPublic] = useState(false);
  const [somePublic, setSomePublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onLoad = useCallback(async () => {
    setIsLoading(true);
    const attachments = await loadAttachments();
    setRows(attachments);
    setIsLoading(false);
  }, [loadAttachments]);

  const onAdd = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        await addAttachment(file);
        await onLoad();
        reloadBorehole();
      } catch (error) {
        showAlert(t((error as Error).message), "error");
        setIsLoading(false);
      }
    },
    [addAttachment, onLoad, reloadBorehole, showAlert, t],
  );

  const onSave = useCallback(async () => {
    setIsLoading(true);
    await updateAttachments(updatedRows);
    setUpdatedRows(new Map());
    await onLoad();
  }, [updateAttachments, updatedRows, onLoad]);

  const onDelete = useCallback(async () => {
    setIsLoading(true);
    const ids = Array.from(apiRef.current.getSelectedRows().keys()).map(id => Number(id));
    await deleteAttachments(ids);
    await onLoad();
    reloadBorehole();
  }, [apiRef, deleteAttachments, onLoad, reloadBorehole]);

  const onExport = useCallback(async () => {
    setIsLoading(true);
    const ids = Array.from(apiRef.current.getSelectedRows().keys()).map(id => Number(id));
    await exportAttachments(ids);
    setIsLoading(false);
  }, [apiRef, exportAttachments]);

  const resetWithoutSave = useCallback(async () => {
    if (apiRef.current && rows) {
      apiRef.current.setRows(rows);
      setUpdatedRows(new Map());
    }
  }, [apiRef, rows]);

  const togglePublicValueForRow = useCallback(
    (id: GridRowId, checked: boolean) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row = newMap.get(id) ?? { public: false };
        row.public = checked;
        newMap.set(id, row);
        return newMap;
      });
      apiRef.current.updateRows([{ id, public: checked }]);
    },
    [apiRef],
  );

  const toggleAllPublicValues = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      const currentRows = apiRef.current.getRowModels();
      Array.from(currentRows.keys()).forEach(id => {
        togglePublicValueForRow(id as GridRowId, checked);
      });
    },
    [apiRef, togglePublicValueForRow],
  );

  const getPublicColumnHeader = useCallback(
    (params: GridColumnHeaderParams) => {
      return editingEnabled ? (
        <Stack flexDirection="row" justifyContent="flex-start" alignItems="center" gap={1}>
          <Checkbox checked={allPublic} indeterminate={somePublic && !allPublic} onChange={toggleAllPublicValues} />
          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>{params.colDef.headerName}</Typography>
        </Stack>
      ) : undefined;
    },
    [allPublic, editingEnabled, somePublic, toggleAllPublicValues],
  );

  const getPublicColumnCell = useCallback(
    (params: GridRenderCellParams) => {
      const cellContent = editingEnabled ? (
        <Checkbox
          checked={params.row.public}
          onChange={event => togglePublicValueForRow(params.row.id, event.target.checked)}
        />
      ) : params.value ? (
        <CheckIcon />
      ) : null;

      return (
        <Stack flexDirection="row" alignItems="center" justifyContent="flex-start" width="100%">
          {cellContent}
        </Stack>
      );
    },
    [editingEnabled, togglePublicValueForRow],
  );

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    const currentRows = apiRef.current?.getRowModels?.();
    if (currentRows) {
      setAllPublic(Array.from(currentRows.values()).every(row => (row as AttachmentWithPublicState).public));
      setSomePublic(Array.from(currentRows.values()).some(row => (row as AttachmentWithPublicState).public));
    }
  }, [apiRef, updatedRows, rows]);

  useEffect(() => {
    markAsChanged(updatedRows.size > 0);
  }, [markAsChanged, updatedRows]);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(resetWithoutSave);

    return () => {
      unMount();
    };
  }, [registerResetHandler, registerSaveHandler, updateAttachments, resetWithoutSave, unMount, onSave]);

  return {
    isLoading,
    rows,
    onAdd,
    onDelete,
    onExport,
    getPublicColumnHeader,
    getPublicColumnCell,
    updatedRows,
    setUpdatedRows,
  };
};
