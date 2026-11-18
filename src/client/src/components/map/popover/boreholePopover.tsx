import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, ButtonBase, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { ChevronRight } from "lucide-react";
import { theme } from "../../../AppTheme.ts";
import { LegendSymbolIcon } from "../legend/legendSymbolIcon.tsx";
import { useLegendLabel } from "../legend/useLegendLabel.ts";
import { BoreholePopoverRow, getPreviewRows } from "./boreholePopoverRows.ts";

interface BoreholePopoverProps {
  rows: readonly BoreholePopoverRow[];
  // A pinned popover lists all boreholes as links, a preview follows the pointer and is not interactive.
  pinned: boolean;
  onHoverRow: (id: number | null) => void;
  onOpenRow: (id: number) => void;
}

const easeOut = "cubic-bezier(0.22, 1, 0.36, 1)";
const rowHeight = 44;
const listPadding = 4;
const valueTextColor = theme.palette.map.popoverValueText;

const popoverIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
`;

const chevronIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
`;

const noMotionSx = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };

const popoverSx = {
  width: "max-content",
  minWidth: "220px",
  maxWidth: "300px",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  borderRadius: "4px",
  boxShadow: theme.shadows[1],
  animation: `${popoverIn} 0.2s ${easeOut}`,
  ...noMotionSx,
};

// Shows five rows; the list scrolls when it has more.
const listSx = {
  maxHeight: `${5 * rowHeight + 2 * listPadding}px`,
  margin: 0,
  padding: `${listPadding}px 0`,
  listStyle: "none",
  overflowY: "auto",
};

const rowSx = {
  display: "flex",
  alignItems: "flex-start",
  gap: "5px",
  width: "100%",
  minWidth: 0,
  height: `${rowHeight}px`,
  padding: "4px 12px 0 8px",
  color: theme.palette.neutral.contrastText,
  textAlign: "left",
};

const chevronClassName = "borehole-popover-chevron";

const buttonRowSx = {
  ...rowSx,
  justifyContent: "flex-start",
  transition: "background-color 0.15s",
  "&:hover, &:focus-visible": { backgroundColor: theme.palette.background.grey, outline: "none" },
  [`&:hover .${chevronClassName}, &:focus-visible .${chevronClassName}`]: {
    color: theme.palette.neutral.contrastText,
    transform: "translateX(2px)",
  },
};

const ellipsisSx = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

interface RowContentProps {
  row: BoreholePopoverRow;
  showChevron: boolean;
}

const RowContent: FC<RowContentProps> = ({ row, showChevron }) => {
  const getLabel = useLegendLabel();
  return (
    <>
      <Box sx={{ display: "flex", marginTop: "-5px" }}>
        <LegendSymbolIcon symbol={row.symbol} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", flex: "1 1 0%", minWidth: 0 }}>
        <Typography variant="body2" sx={{ lineHeight: "20px", ...ellipsisSx }}>
          {row.name}
        </Typography>
        <Typography
          sx={{ fontSize: "12px", lineHeight: "16px", letterSpacing: "0.048px", color: valueTextColor, ...ellipsisSx }}>
          {getLabel(row.legendLabel)}
        </Typography>
      </Box>
      <Box
        className={chevronClassName}
        aria-hidden="true"
        sx={{
          display: "flex",
          flex: "0 0 auto",
          alignSelf: "center",
          marginTop: "-4px",
          marginLeft: 1,
          color: valueTextColor,
          visibility: showChevron ? "visible" : "hidden",
          transition: "color 0.15s, transform 0.15s",
          animation: `${chevronIn} 0.2s ${easeOut}`,
          ...noMotionSx,
          // Overrides the global size and stroke of lucide icons.
          "& svg": { width: "16px", height: "16px", strokeWidth: 1.5 },
        }}>
        <ChevronRight size={16} strokeWidth={1.5} />
      </Box>
    </>
  );
};

/**
 * Lists the boreholes under the pointer on the map. The preview shows a chevron only for a single borehole, which a
 * click opens directly; the pinned popover lists all boreholes as links to their detail page.
 */
export const BoreholePopover: FC<BoreholePopoverProps> = ({ rows, pinned, onHoverRow, onOpenRow }) => {
  const { t } = useTranslation();

  if (pinned) {
    return (
      <Box
        component="section"
        aria-label={t("mapPopoverBoreholes", { count: rows.length })}
        sx={popoverSx}
        data-cy="map-popover">
        <Box component="ul" sx={listSx} onMouseLeave={() => onHoverRow(null)}>
          {rows.map(row => (
            <li key={row.id}>
              <ButtonBase
                sx={buttonRowSx}
                onMouseEnter={() => onHoverRow(row.id)}
                onFocus={() => onHoverRow(row.id)}
                onClick={() => onOpenRow(row.id)}
                data-cy="map-popover-row">
                <RowContent row={row} showChevron={true} />
              </ButtonBase>
            </li>
          ))}
        </Box>
      </Box>
    );
  }

  const { visibleRows, hiddenCount } = getPreviewRows(rows);
  return (
    <Box sx={{ ...popoverSx, pointerEvents: "none" }} data-cy="map-popover-preview">
      <Box component="ul" sx={listSx}>
        {visibleRows.map(row => (
          <Box component="li" key={row.id} sx={rowSx}>
            <RowContent row={row} showChevron={rows.length === 1} />
          </Box>
        ))}
        {hiddenCount > 0 && (
          <Box
            component="li"
            sx={{ ...rowSx, alignItems: "center", paddingTop: 0, paddingLeft: "12px", color: valueTextColor }}>
            <Typography variant="body2">{t("moreBoreholes", { count: hiddenCount })}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
