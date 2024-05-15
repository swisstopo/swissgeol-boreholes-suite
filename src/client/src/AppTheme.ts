import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1c2834",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#424242",
      contrastText: "#ffffff",
      background: "#eeeeee",
    },
    error: {
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#ffffff",
      background: "#ffebee",
    },
    neutral: {
      main: "#d8d8d8",
      contrastText: "#000000",
    },
    hover: {
      main: "#f5f5f5",
    },
    mapIcon: {
      main: "#0b7285",
      secondary: "#a65462",
    },
    boxShadow: "rgba(0, 0, 0, 0.17)",
    background: { default: "#ffffff", lightgrey: "#f1f3f5", darkgrey: "#787878", dark: "rgba(0, 0, 0, 0.5)" },
    buttonSelected: "#AA3526",
  },
  typography: {
    fontFamily: "Lato",
    subtitle1: {
      fontSize: "13px",
      color: "#000000",
      lineHeight: "1.4em",
    },
    subtitle2: {
      fontSize: "10px",
      color: "#787878",
      lineHeight: "1.4em",
    },
    fullPageMessage: {
      fontSize: "23px",
      color: "#000000",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1500,
      xl: 1800,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Lato",
          fontWeight: "bold",
          textTransform: "none",
          marginLeft: "5px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover, &.Mui-focusVisible, &:active, &:focus, &:focus-visible": {
            backgroundColor: "rgba(0, 0, 0, 0.0)",
          },
          "& .MuiTouchRipple-root": {
            display: "none",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "Lato",
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "16px",
        },
      },
    },
  },
});
