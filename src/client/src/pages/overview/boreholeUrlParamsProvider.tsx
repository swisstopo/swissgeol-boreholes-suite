import { FC, PropsWithChildren } from "react";
import { BoreholeUrlParamsContext, useBoreholeUrlParamsState } from "./useBoreholeUrlParams.ts";

/**
 * Holds the single `useQueryStates` instance backing every borehole URL parameter.
 *
 * One instance per consumer would let them disagree while an update propagates, and since the
 * borehole list derives its react-query key from these params, such an intermediate render issues
 * a request for a filter the user never asked for. Sharing one instance means every consumer reads
 * the same snapshot in the same commit, so no half-applied filter can ever be requested.
 */
export const BoreholeUrlParamsProvider: FC<PropsWithChildren> = ({ children }) => {
  const value = useBoreholeUrlParamsState();
  return <BoreholeUrlParamsContext.Provider value={value}>{children}</BoreholeUrlParamsContext.Provider>;
};
