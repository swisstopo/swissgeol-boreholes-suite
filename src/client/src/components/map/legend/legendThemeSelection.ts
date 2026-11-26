import { LegendTheme, LegendThemeKey, legendThemeKeys, legendThemes } from "./legendThemes.ts";

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
 * anonymous mode.
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
