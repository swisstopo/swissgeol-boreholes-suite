import { LegendTheme, LegendThemeKey, legendThemeKeys, legendThemes } from "./legendThemes.ts";

/**
 * Returns the legend themes the user can switch between, in cycle order. Never empty: the borehole type theme is
 * always available.
 */
export const getAvailableLegendThemes = (anonymousModeEnabled: boolean): readonly LegendTheme[] =>
  legendThemeKeys.flatMap(key => {
    const legendTheme = legendThemes[key];
    if (!legendTheme || (anonymousModeEnabled && !legendTheme.visibleInAnonymousMode)) return [];
    return [legendTheme];
  });

/**
 * Returns the requested theme, or the first available theme when the request is missing, unknown, hidden in
 * anonymous mode or not implemented yet.
 */
export const resolveLegendTheme = (
  requested: LegendThemeKey | null,
  availableThemes: readonly LegendTheme[],
): LegendTheme => availableThemes.find(legendTheme => legendTheme.key === requested) ?? availableThemes[0];

/**
 * Returns the theme after the current one, wrapping around to the first.
 */
export const getNextLegendTheme = (current: LegendTheme, availableThemes: readonly LegendTheme[]): LegendTheme => {
  const index = availableThemes.indexOf(current);
  return availableThemes[(index + 1) % availableThemes.length];
};
