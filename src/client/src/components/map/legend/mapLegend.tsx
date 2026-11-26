import { CSSProperties, FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Divider,
  IconButton,
  Stack,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { SystemStyleObject } from "@mui/system";
import { ArrowRightLeft, ChevronUp, Lightbulb } from "lucide-react";
import { theme } from "../../../AppTheme.ts";
import { useBoreholeUrlParams } from "../../../pages/overview/useBoreholeUrlParams.ts";
import { LegendSymbolIcon } from "./legendSymbolIcon.tsx";
import { ContentSegment, contentSegments, LegendTheme } from "./legendThemes.ts";
import { useLegendExpanded } from "./useLegendExpanded.ts";
import { useLegendLabel } from "./useLegendLabel.ts";

interface MapLegendProps {
  legendTheme: LegendTheme;
  // Undefined when there is only one theme to show.
  onSwitchTheme: (() => void) | undefined;
  onHighlightBoreholes: () => void;
}

const iconSize = 20;
const easeOut = "cubic-bezier(0.22, 1, 0.36, 1)";

// Plain 36 x 36 icon buttons: the theme's primary icon button is a filled one.
const legendButtonSx = { color: theme.palette.primary.main, width: "36px", height: "36px" };

const legendIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
`;

// The title and the entries of a new theme fade in. The elements are keyed by the theme, so the animation restarts.
const fadeInSx = (duration: string) => ({
  animation: `${legendIn} ${duration} ${easeOut}`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});

const legendMargin = 2;

// The legend keeps the same margin to the bottom of the map as to the top, so the list scrolls only when needed.
const legendSx: SystemStyleObject<Theme> = {
  position: "absolute",
  top: theme.spacing(legendMargin),
  left: theme.spacing(legendMargin),
  zIndex: 500,
  minWidth: "187px",
  maxHeight: `calc(100% - ${theme.spacing(2 * legendMargin)})`,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  borderRadius: "4px",
  boxShadow: theme.shadows[1],
  overflow: "hidden",
};

const headerSx = (expanded: boolean): SystemStyleObject<Theme> => ({
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  padding: 1,
  backgroundColor: theme.palette.background.grey,
  borderBottom: `1px solid ${expanded ? theme.palette.border.light : "transparent"}`,
  transition: "border-color 0.25s",
});

const headerActionsSx: SystemStyleObject<Theme> = { alignItems: "center", gap: 0.5 };

const titleSx: SystemStyleObject<Theme> = { fontWeight: 700, ...fadeInSx("0.25s") };

const toggleIconStyle = (expanded: boolean): CSSProperties => ({
  transition: "transform 0.3s",
  transform: expanded ? "none" : "rotate(180deg)",
});

// A grid row animates between 0fr and 1fr, and unlike a fixed height lets the list scroll when space is short.
const collapsibleSx = (expanded: boolean): SystemStyleObject<Theme> => ({
  display: "grid",
  gridTemplateRows: expanded ? "1fr" : "0fr",
  transition: "grid-template-rows 0.3s",
  flex: "0 1 auto",
  minHeight: 0,
});

const collapsibleContentSx: SystemStyleObject<Theme> = {
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const entryListSx: SystemStyleObject<Theme> = {
  flex: "0 1 auto",
  minHeight: 0,
  margin: 0,
  padding: theme.spacing(1.25, 2, 1.125),
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  overflowY: "auto",
  ...fadeInSx("0.3s"),
};

const entrySx: SystemStyleObject<Theme> = { alignItems: "center", gap: 0.625, whiteSpace: "nowrap" };

const contentSegmentsSx: SystemStyleObject<Theme> = {
  flexShrink: 0,
  padding: theme.spacing(1.5, 2, 0.25),
  ...fadeInSx("0.3s"),
};

// A grey track with a white thumb that slides to the selected segment. The buttons stay transparent above the thumb.
const segmentGroupSx = (selectedIndex: number): SystemStyleObject<Theme> => ({
  position: "relative",
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "1fr",
  width: "100%",
  padding: "2px",
  backgroundColor: theme.palette.background.header,
  border: `1px solid ${theme.palette.border.light}`,
  borderRadius: "4px",
  boxShadow: "none",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "2px",
    bottom: "2px",
    left: "2px",
    width: `calc((100% - 4px) / ${contentSegments.length})`,
    boxSizing: "border-box",
    transform: `translateX(${selectedIndex * 100}%)`,
    transition: `transform 0.22s ${easeOut}`,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.border.light}`,
    borderRadius: "3px",
    boxShadow: `0px 1px 2px ${theme.palette.map.legendSegmentShadow}`,
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
  },
  "& .MuiToggleButton-root": {
    zIndex: 1,
    height: "28px",
    margin: 0,
    padding: theme.spacing(0, 1.25),
    border: 0,
    fontSize: "14px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: theme.palette.map.legendSegmentText,
    transition: "color 0.15s",
    "&:hover": { color: theme.palette.secondary.main, backgroundColor: "transparent" },
    "&.Mui-selected, &.Mui-selected:hover": { color: theme.palette.primary.main, backgroundColor: "transparent" },
    "&.Mui-focusVisible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: "-2px" },
  },
});

const contentSegmentLabelKeys: Record<ContentSegment, string> = {
  profile: "profile",
  documents: "documents",
  photos: "photos",
};

/**
 * Selects which attachments the contents theme shows. The segment is kept in the URL, where the legend theme reads it.
 */
const ContentSegmentControl: FC = () => {
  const { t } = useTranslation();
  const { legendContent, setLegendContent } = useBoreholeUrlParams();

  return (
    <ToggleButtonGroup
      exclusive
      value={legendContent}
      onChange={(_event, segment: ContentSegment | null) => {
        if (segment !== null) setLegendContent(segment);
      }}
      aria-label={t("availableContents")}
      sx={segmentGroupSx(contentSegments.indexOf(legendContent))}
      data-cy="map-legend-content">
      {contentSegments.map(segment => (
        <ToggleButton key={segment} value={segment} data-cy={`map-legend-content-${segment}`}>
          {t(contentSegmentLabelKeys[segment])}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

/**
 * Explains the symbols on the map for the active legend theme, lets the user switch the theme, choose the attachments
 * of the contents theme and highlight the boreholes on the map.
 */
export const MapLegend: FC<MapLegendProps> = ({ legendTheme, onSwitchTheme, onHighlightBoreholes }) => {
  const { t } = useTranslation();
  const getLabel = useLegendLabel();
  const { expanded, toggleExpanded } = useLegendExpanded();
  const switchThemeLabel = t("switchLegend");
  const toggleLabel = expanded ? t("collapseLegend") : t("expandLegend");

  return (
    <Stack component="section" aria-label={t("legend")} data-cy="map-legend" sx={legendSx}>
      <Stack direction="row" sx={headerSx(expanded)}>
        <Stack direction="row" sx={headerActionsSx}>
          <Tooltip title={switchThemeLabel}>
            {/* The span keeps the tooltip working while the button is disabled. */}
            <span>
              <IconButton
                size="small"
                sx={legendButtonSx}
                aria-label={switchThemeLabel}
                disabled={!onSwitchTheme}
                onClick={onSwitchTheme}
                data-cy="map-legend-switch">
                <ArrowRightLeft size={iconSize} />
              </IconButton>
            </span>
          </Tooltip>
          <Typography key={legendTheme.key} variant="body2" component="h2" sx={titleSx} data-cy="map-legend-title">
            {t(legendTheme.titleKey)}
          </Typography>
          <Tooltip title={t("highlightBoreholes")}>
            <IconButton
              size="small"
              sx={legendButtonSx}
              aria-label={t("highlightBoreholes")}
              onClick={onHighlightBoreholes}
              data-cy="map-legend-highlight">
              <Lightbulb size={iconSize} />
            </IconButton>
          </Tooltip>
        </Stack>
        <IconButton
          size="small"
          sx={legendButtonSx}
          aria-label={toggleLabel}
          aria-expanded={expanded}
          onClick={toggleExpanded}
          data-cy="map-legend-toggle">
          <ChevronUp size={iconSize} style={toggleIconStyle(expanded)} />
        </IconButton>
      </Stack>
      <Box inert={!expanded} sx={collapsibleSx(expanded)}>
        <Box sx={collapsibleContentSx}>
          {legendTheme.key === "contents" && (
            <Box sx={contentSegmentsSx}>
              <ContentSegmentControl />
            </Box>
          )}
          <Box key={legendTheme.key} component="ul" sx={entryListSx}>
            {legendTheme.entries.map((entry, index) => (
              <Fragment key={entry.key}>
                {index > 0 && entry.group !== legendTheme.entries[index - 1].group && <Divider component="li" />}
                <Stack component="li" direction="row" sx={entrySx}>
                  <LegendSymbolIcon symbol={entry.symbol} />
                  <Typography variant="body2">{getLabel(entry.label)}</Typography>
                </Stack>
              </Fragment>
            ))}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};
