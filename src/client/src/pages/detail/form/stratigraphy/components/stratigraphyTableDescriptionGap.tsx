import { FC } from "react";
import { Stack, SxProps } from "@mui/material";
import { theme } from "../../../../../AppTheme.ts";
import { LayerAddButton } from "./layerAddButton.tsx";
import { StratigraphyTableCell, StratigraphyTableCellRow } from "./stratigraphyTablePrimitives.tsx";

interface StratigraphyTableDescriptionGapProps {
  index: number;
  onClick?: (index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  sx?: SxProps;
  dataCy?: string;
}

export const StratigraphyTableDescriptionGap: FC<StratigraphyTableDescriptionGapProps> = ({
  index,
  onClick,
  onMouseEnter,
  onMouseLeave,
  sx,
  dataCy,
}) => (
  <StratigraphyTableCell
    sx={{
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      backgroundColor: theme.palette.background.lightgrey,

      ...(onClick && {
        "&:hover": {
          backgroundColor: theme.palette.background.grey,
          cursor: "pointer",
        },
      }),
      ...sx,
    }}
    data-cy={`${dataCy}-gap`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={() => {
      if (onClick) {
        onClick(index);
      }
    }}>
    <StratigraphyTableCellRow />
    {onClick && (
      <Stack direction="row" justifyContent="center" alignItems="center">
        <LayerAddButton dataCy={`${dataCy}-add-button`} />
      </Stack>
    )}
    <StratigraphyTableCellRow />
  </StratigraphyTableCell>
);
