import { useMemo } from "react";
import { useAuth } from "../../../auth/useBoreholesAuth.tsx";
import { useBoreholeUrlParams } from "../../../pages/overview/useBoreholeUrlParams.ts";
import { getAvailableLegendThemes, getNextLegendTheme, resolveLegendTheme } from "./legendThemeSelection.ts";

/**
 * Returns the active legend theme from the URL and a function to switch to the next one. The function is undefined
 * when only one theme is available.
 */
export const useLegendTheme = () => {
  const { anonymousModeEnabled } = useAuth();
  const { legend, setLegend } = useBoreholeUrlParams();
  const availableThemes = useMemo(() => getAvailableLegendThemes(anonymousModeEnabled), [anonymousModeEnabled]);
  const legendTheme = resolveLegendTheme(legend, availableThemes);

  const switchToNextTheme =
    availableThemes.length > 1 ? () => setLegend(getNextLegendTheme(legendTheme, availableThemes).key) : undefined;

  return { legendTheme, switchToNextTheme };
};
