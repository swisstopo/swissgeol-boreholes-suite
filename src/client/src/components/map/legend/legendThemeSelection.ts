import {
  ContentSegment,
  contentsLegendThemes,
  LegendTheme,
  LegendThemeKey,
  legendThemeKeys,
  legendThemes,
} from "./legendThemes.ts";

/**
 * Returns the legend themes the user can switch between, in cycle order. Never empty: the borehole type theme is
 * always available.
 */
export const getAvailableLegendThemes = (anonymousModeEnabled: boolean): readonly LegendTheme[] =>
  legendThemeKeys
    .map(key => legendThemes[key])
    .filter(legendTheme => !anonymousModeEnabled || legendTheme.visibleInAnonymousMode);

/**
 * Returns the requested theme, or the first available theme when the request is missing, unknown or hidden in
 * anonymous mode. The contents theme comes with the selected segment.
 */
export const resolveLegendTheme = (
  requested: LegendThemeKey | null,
  availableThemes: readonly LegendTheme[],
  contentSegment: ContentSegment,
): LegendTheme => {
  const legendTheme = availableThemes.find(availableTheme => availableTheme.key === requested) ?? availableThemes[0];
  return legendTheme.key === "contents" ? contentsLegendThemes[contentSegment] : legendTheme;
};

/**
 * Returns the theme after the current one, wrapping around to the first. Themes compare by key, so every segment of
 * the contents theme is at its place in the cycle.
 */
export const getNextLegendTheme = (current: LegendTheme, availableThemes: readonly LegendTheme[]): LegendTheme => {
  const index = availableThemes.findIndex(availableTheme => availableTheme.key === current.key);
  return availableThemes[(index + 1) % availableThemes.length];
};
