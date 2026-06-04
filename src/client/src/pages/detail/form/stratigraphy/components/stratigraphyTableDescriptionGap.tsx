import { FC, MouseEvent } from "react";
import { Stack, SxProps } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { LayerAddButton } from "./layerAddButton.tsx";
import { StratigraphyTableCell, StratigraphyTableCellRow } from "./stratigraphyTablePrimitives.tsx";

interface StratigraphyTableDescriptionGapProps {
  onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
  sx?: SxProps;
  dataCy?: string;
}

export const StratigraphyTableDescriptionGap: FC<StratigraphyTableDescriptionGapProps> = ({
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  isSelected,
  sx,
  dataCy,
}) => {
  const interactive = !!onMouseDown;
  return (
    <StratigraphyTableCell
      sx={{
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        backgroundColor: isSelected ? theme.palette.background.listItemActive : theme.palette.background.lightgrey,
        ...(isSelected && { userSelect: "none" }),

        ...(interactive && {
          cursor: "pointer",
          "&:hover": {
            backgroundColor: isSelected ? theme.palette.background.listItemActive : theme.palette.background.grey,
          },
        }),
        ...sx,
      }}
      data-cy={`${dataCy}-gap`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      <StratigraphyTableCellRow />
      {interactive && (
        <Stack direction="row" justifyContent="center" alignItems="center">
          <LayerAddButton dataCy={`${dataCy}-add-button`} />
        </Stack>
      )}
      <StratigraphyTableCellRow />
    </StratigraphyTableCell>
  );
};
