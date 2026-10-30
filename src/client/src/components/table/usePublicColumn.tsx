import { ChangeEvent, Dispatch, RefObject, SetStateAction, useCallback, useContext } from "react";
import { Checkbox, Stack } from "@mui/material";
import { GridColumnHeaderParams, GridRenderCellParams, GridRowId } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { CheckIcon } from "lucide-react";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { PublicColumnHeader } from "./publicColumnHeader.tsx";

interface ItemWithPublicState {
  public?: boolean | null;
}

interface UsePublicColumnProps<T extends ItemWithPublicState> {
  apiRef: RefObject<GridApiCommunity>;
  updatedRows: Map<GridRowId, T>;
  setUpdatedRows: Dispatch<SetStateAction<Map<GridRowId, T>>>;
}

export const usePublicColumn = <T extends ItemWithPublicState>({
  apiRef,
  updatedRows,
  setUpdatedRows,
}: UsePublicColumnProps<T>) => {
  const { editingEnabled } = useContext(EditStateContext);

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
      for (const id of Array.from(currentRows.keys())) {
        togglePublicValueForRow(id, checked);
      }
    },
    [apiRef, togglePublicValueForRow],
  );

  const getPublicColumnHeader = useCallback(
    (params: GridColumnHeaderParams<T>) => {
      return editingEnabled ? (
        <PublicColumnHeader onToggleAll={toggleAllPublicValues} headerName={params.colDef.headerName} />
      ) : undefined;
    },
    [editingEnabled, toggleAllPublicValues],
  );

  const getPublicColumnCell = useCallback(
    (params: GridRenderCellParams<T, boolean | null>) => {
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

  return {
    getPublicColumnHeader,
    getPublicColumnCell,
  };
};
