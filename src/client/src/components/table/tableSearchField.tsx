import { FC, MutableRefObject, useEffect, useState } from "react";
import { InputAdornment, TextField } from "@mui/material";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { Search } from "lucide-react";
import i18next from "i18next";
import { muiLocales } from "../../mui.locales";

interface TableSearchFieldProps {
  apiRef: MutableRefObject<GridApiCommunity>;
}

export const TableSearchField: FC<TableSearchFieldProps> = ({ apiRef }) => {
  const [search, setSearch] = useState<string>("");
  useEffect(() => {
    apiRef.current.setQuickFilterValues(search.split(" ").filter(word => word));
  }, [apiRef, search]);

  return (
    <TextField
      sx={{ m: 0 }}
      placeholder={muiLocales[i18next.language].toolbarQuickFilterPlaceholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
  );
};
