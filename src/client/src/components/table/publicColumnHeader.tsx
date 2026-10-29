import { ChangeEvent, FC } from "react";
import { Checkbox, Stack, Typography } from "@mui/material";
import { gridDataRowIdsSelector, gridRowsLookupSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";

interface PublicColumnHeaderProps {
  onToggleAll: (event: ChangeEvent<HTMLInputElement>) => void;
  headerName?: string;
}

// Reads the rows from the grid state, so the header follows every row change: rows the grid receives
// as props after it mounted as well as rows toggled in the grid.
export const PublicColumnHeader: FC<PublicColumnHeaderProps> = ({ onToggleAll, headerName }) => {
  const apiRef = useGridApiContext();
  const rowIds = useGridSelector(apiRef, gridDataRowIdsSelector);
  const rowsLookup = useGridSelector(apiRef, gridRowsLookupSelector);
  const publicStates = rowIds.map(id => rowsLookup[id]?.public === true);
  const allPublic = publicStates.length > 0 && publicStates.every(Boolean);
  const somePublic = publicStates.some(Boolean);

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={1} data-cy={"public-header"}>
      <Checkbox checked={allPublic} indeterminate={somePublic && !allPublic} onChange={onToggleAll} />
      <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>{headerName}</Typography>
    </Stack>
  );
};
