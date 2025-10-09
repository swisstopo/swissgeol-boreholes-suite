import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridRowId } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { RefObject } from "@mui/x-internals/types";
import { useReloadBoreholes } from "../../../api/borehole.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { usePublicColumn } from "../../../components/table/usePublicColumn.tsx";
import { useResetTabStatus } from "../../../hooks/useResetTabStatus.ts";
import { TabName } from "../form/workflow/workflow.ts";
import { SaveContext, SaveContextProps } from "../saveContext.tsx";

export interface AttachmentWithPublicState {
  public?: boolean;
}

interface UseAttachmentsProps<T extends AttachmentWithPublicState> {
  apiRef: RefObject<GridApiCommunity>;
  loadAttachments: () => Promise<T[]>;
  addAttachment: (file?: File) => Promise<void>;
  updateAttachments: (updatedRows: Map<GridRowId, T>) => Promise<boolean>;
  deleteAttachments: (ids: number[]) => Promise<void>;
  exportAttachments: (ids: number[]) => Promise<void>;
  tabStatusToReset: TabName;
}

export const useAttachments = <T extends AttachmentWithPublicState>({
  apiRef,
  loadAttachments,
  addAttachment,
  updateAttachments,
  deleteAttachments,
  exportAttachments,
  tabStatusToReset,
}: UseAttachmentsProps<T>) => {
  const { t } = useTranslation();
  const { registerSaveHandler, registerResetHandler, unMount, markAsChanged } =
    useContext<SaveContextProps>(SaveContext);
  const { showAlert } = useContext(AlertContext);
  const reloadBoreholes = useReloadBoreholes();
  const resetTabStatus = useResetTabStatus([tabStatusToReset]);

  const [rows, setRows] = useState<T[]>();
  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, T>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const { getPublicColumnHeader, getPublicColumnCell } = usePublicColumn({
    apiRef,
    updatedRows,
    setUpdatedRows,
    rows,
  });

  const onLoad = useCallback(async () => {
    setIsLoading(true);
    const attachments = await loadAttachments();
    setRows(attachments);
    setIsLoading(false);
  }, [loadAttachments]);

  const onAdd = useCallback(
    async (file?: File) => {
      try {
        setIsLoading(true);
        await addAttachment(file);
        await onLoad();
        reloadBoreholes();
        resetTabStatus();
      } catch (error) {
        showAlert(t((error as Error).message), "error");
        setIsLoading(false);
      }
    },
    [addAttachment, onLoad, reloadBoreholes, resetTabStatus, showAlert, t],
  );

  const removeCellFocus = useCallback(() => {
    const editRows = apiRef.current.state.editRows;
    const rowId = Object.keys(editRows)[0];
    const field = rowId ? Object.keys(editRows[rowId])[0] : undefined;

    if (rowId && field) {
      apiRef.current.stopCellEditMode({ id: rowId, field });
    }
  }, [apiRef]);

  const onSave = useCallback(async () => {
    setIsLoading(true);
    removeCellFocus();
    const success = await updateAttachments(updatedRows);
    if (success) {
      resetTabStatus();
      setUpdatedRows(new Map());
      await onLoad();
    }
    return success;
  }, [updateAttachments, updatedRows, onLoad, removeCellFocus, resetTabStatus]);

  const onDelete = useCallback(async () => {
    setIsLoading(true);
    const ids = Array.from(apiRef.current.getSelectedRows().keys()).map(id => Number(id));
    await deleteAttachments(ids);
    await onLoad();
    reloadBoreholes();
    resetTabStatus();
  }, [apiRef, deleteAttachments, onLoad, reloadBoreholes, resetTabStatus]);

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

  useEffect(() => {
    onLoad();
  }, [onLoad]);

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
