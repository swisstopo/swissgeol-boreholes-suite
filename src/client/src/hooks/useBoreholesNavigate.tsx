import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

export const useBoreholesNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(
    ({ path, hash, replace }: { path?: string; hash?: string; replace?: boolean }) => {
      const pathname = path || location.pathname;
      const hashValue = hash?.split("?")[0];
      const replaceValue = replace ?? false;

      // Only preserve search params when staying on the same page.
      const isSamePage = pathname === location.pathname;
      let searchParams: string | undefined;
      if (isSamePage) {
        const locationSearch = location.search;
        const searchFromHash = location.hash.split("?")[1];
        if (locationSearch) {
          searchParams = locationSearch;
        } else if (searchFromHash) {
          searchParams = searchFromHash;
        }
      }
      const normalizedSearch = searchParams ?? "";
      const normalizedLocationSearch = location.search ?? "";

      if (
        pathname !== location.pathname ||
        hashValue !== location.hash.split("?")[0] ||
        normalizedSearch !== normalizedLocationSearch
      ) {
        navigate(
          {
            pathname,
            search: searchParams,
            hash: hashValue,
          },
          { replace: replaceValue },
        );
      }
    },
    [location.hash, location.pathname, location.search, navigate],
  );

  return { navigateTo };
};
