import { theme } from "../../../../../AppTheme.ts";

export const defaultStyle = {
  control: {
    backgroundColor: theme.palette.background.default,
    fontSize: "14px",
    fontWeight: "normal",
  },

  highlighter: {
    left: ".15rem",
    lineHeight: "17px",
    padding: "0px",
    boxSizing: "content-box",
    width: "110%",
  },

  input: {
    margin: 0,
    outline: "1px",
  },
};
