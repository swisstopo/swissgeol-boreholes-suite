import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Stack, Typography } from "@mui/material";
import { GridColumnHeaderParams, GridRenderCellParams, GridRowId } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { RefObject } from "@mui/x-internals/types";
import { CheckIcon } from "lucide-react";
import { useReloadBoreholes } from "../../../api/borehole.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { useResetTabStatus } from "../../../hooks/useResetTabStatus.ts";
import { EditStateContext } from "../editStateContext.tsx";
import { TabName } from "../form/workflow/workflow.ts";
import { SaveContext, SaveContextProps } from "../saveContext.tsx";

export interface AttachmentWithPublicState {
  public?: boolean;
}

interface UseAttachmentsProps<T extends AttachmentWithPublicState> {
  apiRef: RefObject<GridApiCommunity>;
  loadAttachments: () => Promise<T[]>;
  addAttachment: (file?: File) => Promise<void>;
  updateAttachments: (updatedRows: Map<GridRowId, T>) => Promise<void>;
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
  const { editingEnabled } = useContext(EditStateContext);
  const { registerSaveHandler, registerResetHandler, unMount, markAsChanged } =
    useContext<SaveContextProps>(SaveContext);
  const { showAlert } = useContext(AlertContext);
  const reloadBoreholes = useReloadBoreholes();
  const resetTabStatus = useResetTabStatus([tabStatusToReset]);

  const [rows, setRows] = useState<T[]>();
  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, T>>(new Map());
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
    await updateAttachments(updatedRows);
    resetTabStatus();
    setUpdatedRows(new Map());
    await onLoad();
  }, [removeCellFocus, updateAttachments, updatedRows, resetTabStatus, onLoad]);

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

  const togglePublicValueForRow = useCallback(
    (id: GridRowId, checked: boolean) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row = newMap.get(id) ?? ({ public: false } as T);
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
        togglePublicValueForRow(id, checked);
      });
    },
    [apiRef, togglePublicValueForRow],
  );

  const getPublicColumnHeader = useCallback(
    (params: GridColumnHeaderParams<T>) => {
      return editingEnabled ? (
        <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={1} data-cy={"public-header"}>
          <Checkbox checked={allPublic} indeterminate={somePublic && !allPublic} onChange={toggleAllPublicValues} />
          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>{params.colDef.headerName}</Typography>
        </Stack>
      ) : undefined;
    },
    [allPublic, editingEnabled, somePublic, toggleAllPublicValues],
  );

  const getPublicColumnCell = useCallback(
    (params: GridRenderCellParams<T>) => {
      const readonlyContent = (
        <Stack direction="row" alignItems="center" justifyContent="center">
          {params.value ? <CheckIcon /> : null}
        </Stack>
      );

      const editableContent = (
        <Stack direction="row" alignItems="center" justifyContent="flex-start" width="100%" pl={1.25}>
          <Checkbox
            checked={updatedRows.get(params.id)?.public ?? params.value ?? false}
            onChange={event => togglePublicValueForRow(params.id, event.target.checked)}
          />
        </Stack>
      );

      return editingEnabled ? editableContent : readonlyContent;
    },
    [editingEnabled, togglePublicValueForRow, updatedRows],
  );

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    const currentRows = apiRef.current?.getRowModels?.();
    if (currentRows) {
      setAllPublic(Array.from(currentRows.values()).every(row => (row as T).public));
      setSomePublic(Array.from(currentRows.values()).some(row => (row as T).public));
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
