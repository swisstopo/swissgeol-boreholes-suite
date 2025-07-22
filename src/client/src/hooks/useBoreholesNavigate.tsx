import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useBoreholesNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(
    ({
      path,
      hash,
      search,
      preserveSearch,
      replace,
    }: {
      path?: string;
      hash?: string;
      search?: string;
      preserveSearch?: boolean;
      replace?: boolean;
    }) => {
      const pathname = path || location.pathname;
      const hashValue = hash?.split("?")[0];
      const preserveSearchValue = preserveSearch ?? true;
      const replaceValue = replace ?? false;
      let searchParams = search;
      if (!searchParams && preserveSearchValue) {
        const locationSearch = location.search;
        const searchFromHash = location.hash.split("?")[1];

        if (locationSearch) {
          searchParams = locationSearch;
        } else if (searchFromHash) {
          searchParams = `${searchFromHash}`;
        }
      }

      if (
        pathname !== location.pathname ||
        hashValue !== location.hash.split("?")[0] ||
        searchParams !== location.search
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
