import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadSettings } from "../../api-lib/index";

export const DataLoader = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  return children;
};
