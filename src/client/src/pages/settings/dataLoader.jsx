import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { loadSettings } from "../../api-lib/index";
import { SplashScreen } from "../../auth/SplashScreen";

export const DataLoader = ({ children }) => {
  const dispatch = useDispatch();
  const isReady = useSelector(state => state.dataLoaderState.isReady);

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  return isReady ? (
    children
  ) : (
    <SplashScreen>
      <CircularProgress />
    </SplashScreen>
  );
};
