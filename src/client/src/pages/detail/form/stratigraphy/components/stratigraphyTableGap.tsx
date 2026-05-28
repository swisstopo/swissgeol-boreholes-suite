import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack, SxProps } from "@mui/material";
import { TriangleAlert } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";
import { LayerAddButton } from "./layerAddButton.tsx";
import { StratigraphyTableCell, StratigraphyTableCellRow } from "./stratigraphyTablePrimitives.tsx";

interface StratigraphyTableGapProps {
  index: number;
  onClick?: (index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  sx?: SxProps;
  dataCy?: string;
}

export const StratigraphyTableGap: FC<StratigraphyTableGapProps> = ({
  index,
  onClick,
  onMouseEnter,
  onMouseLeave,
  sx,
  dataCy,
}) => {
  const { t } = useTranslation();
  return (
    <StratigraphyTableCell
      sx={{
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        backgroundColor: theme.palette.error.background,

        ...(onClick && {
          "&:hover": {
            backgroundColor: theme.palette.error.backgroundHover,
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
      <StratigraphyTableCellRow color={theme.palette.error.main}>
        <Chip color="error" label={t("gap")} />
        <TriangleAlert />
      </StratigraphyTableCellRow>
      {onClick && (
        <Stack direction="row" justifyContent="center" alignItems="center">
          <LayerAddButton dataCy={`${dataCy}-add-button`} />
        </Stack>
      )}
      <StratigraphyTableCellRow />
    </StratigraphyTableCell>
  );
};
