import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { CircularProgress } from "@mui/material";
import { loadBoreholes, loadDomains, loadSettings } from "../../api-lib/index";
import { SplashScreen } from "../../auth/SplashScreen";

export const DataLoader = ({ children }) => {
  const dispatch = useDispatch();
  const isReady = useStore(state => state.dataLoaderState.isReady);

  useEffect(() => {
    dispatch(loadDomains());
    // Only load one borehole to get the total borehole count.
    // We need the count in case of the map only appearance, otherwise the boreholes get loaded by the borehole table.
    dispatch(loadBoreholes(1, 1));
    dispatch(loadSettings());
  });

  return isReady ? (
    children
  ) : (
    <SplashScreen>
      <CircularProgress />
    </SplashScreen>
  );
};
