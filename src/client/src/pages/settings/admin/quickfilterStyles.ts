import { theme } from "../../../AppTheme.ts";

export const quickFilterStyles = {
  "& .MuiDataGrid-toolbarContainer .MuiDataGrid-toolbarQuickFilter .MuiInput-root": {
    outline: `1px solid ${theme.palette.secondary.main} !important`,
    padding: "8px 4px  4px 4px",
    borderRadius: "4px",
    color: theme.palette.secondary.main,
    "&:focus-within": {
      outline: `2px solid ${theme.palette.primary.main} !important`,
    },
  },
  "& .MuiDataGrid-toolbarContainer .MuiInput-underline:after, & .MuiDataGrid-toolbarContainer .MuiInput-underline:before":
    {
      borderBottom: "none",
    },
  "& .MuiDataGrid-toolbarContainer .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "none",
  },
  "& .MuiDataGrid-toolbarContainer .MuiInput-underline.Mui-focused:after": {
    borderBottom: "none",
  },
};
