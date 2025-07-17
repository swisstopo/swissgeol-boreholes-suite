import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useBoreholesNavigate = () => {
  const navigate = useNavigate();

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
      const pathname = path || window.location.pathname;
      let hashValue = hash || window.location.hash;
      hashValue = hashValue.split("?")[0];
      let searchParams = search;
      if (!searchParams) {
        const locationSearch = window.location.search;
        const searchFromHash = window.location.hash.split("?")[1];

        if (locationSearch) {
          searchParams = locationSearch;
        } else if (searchFromHash) {
          searchParams = `${searchFromHash}`;
        }
      }

      const preserveSearchValue = preserveSearch ?? true;
      const replaceValue = replace ?? false;

      console.log(
        "Navigating to:",
        path,
        pathname,
        hash,
        hashValue,
        search,
        searchParams,
        preserveSearchValue,
        replaceValue,
      );

      if (
        path !== window.location.pathname ||
        hash !== window.location.hash.split("?")[0] ||
        (search !== searchParams && !preserveSearchValue)
      ) {
        if (searchParams) {
          navigate(
            {
              pathname,
              search: searchParams.toString(),
              hash: hash,
            },
            { replace: replaceValue },
          );
        } else {
          navigate(
            {
              pathname,
              hash: hash,
            },
            { replace: replaceValue },
          );
        }
      }
    },
    [navigate],
  );

  return { navigateTo };
};
