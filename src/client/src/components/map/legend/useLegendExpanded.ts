import { useBoreholeUrlParams } from "../../../pages/overview/useBoreholeUrlParams.ts";

/**
 * Whether the legend is expanded, kept in the URL and in the session like the legend theme, so it stays the same after
 * visiting a borehole.
 */
export const useLegendExpanded = () => {
  const { legendExpanded, setLegendExpanded } = useBoreholeUrlParams();
  const toggleExpanded = () => setLegendExpanded(!legendExpanded);
  return { expanded: legendExpanded, toggleExpanded };
};
