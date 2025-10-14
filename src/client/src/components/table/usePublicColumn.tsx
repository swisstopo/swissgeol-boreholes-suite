import { ChangeEvent, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { Checkbox, Stack, Typography } from "@mui/material";
import { GridColumnHeaderParams, GridRenderCellParams, GridRowId } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { RefObject } from "@mui/x-internals/types";
import { CheckIcon } from "lucide-react";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";

export interface ItemWithPublicState {
  public?: boolean;
}

interface UsePublicColumnProps<T extends ItemWithPublicState> {
  apiRef: RefObject<GridApiCommunity>;
  updatedRows: Map<GridRowId, T>;
  setUpdatedRows: Dispatch<SetStateAction<Map<GridRowId, T>>>;
  rows?: T[];
}

export const usePublicColumn = <T extends ItemWithPublicState>({
  apiRef,
  updatedRows,
  setUpdatedRows,
  rows,
}: UsePublicColumnProps<T>) => {
  const { editingEnabled } = useContext(EditStateContext);
  const [allPublic, setAllPublic] = useState(false);
  const [somePublic, setSomePublic] = useState(false);

  const togglePublicValueForRow = useCallback(
    (id: GridRowId, checked: boolean) => {
      setUpdatedRows((prevRows: Map<GridRowId, T>) => {
        const newMap = new Map(prevRows);
        const row = newMap.get(id) ?? ({ public: false } as T);
        row.public = checked;
        newMap.set(id, row);
        return newMap;
      });
      apiRef.current.updateRows([{ id, public: checked }]);
    },
    [apiRef, setUpdatedRows],
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

  // Update allPublic and somePublic states when rows or updatedRows change
  useEffect(() => {
    const currentRows = apiRef.current?.getRowModels?.();
    if (currentRows) {
      setAllPublic(Array.from(currentRows.values()).every(row => (row as T).public));
      setSomePublic(Array.from(currentRows.values()).some(row => (row as T).public));
    }
  }, [apiRef, updatedRows, rows]);

  return {
    getPublicColumnHeader,
    getPublicColumnCell,
  };
};
