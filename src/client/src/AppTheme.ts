import { createTheme } from "@mui/material/styles";
import ArrowDownIcon from "./assets/icons/arrow_down.svg?react";

export const theme = createTheme({
  palette: {
    action: {
      disabled: "#828E9A",
    },
    primary: {
      main: "#337083",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1c2834",
      contrastText: "#ffffff",
      background: "#eeeeee",
    },
    success: {
      main: "#059669",
    },
    warning: {
      main: "#EA580C",
    },
    error: {
      main: "#99191E",
      dark: "#801519",
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
      main: "#337083",
      secondary: "#a65462",
    },
    boxShadow: "#DFE4E9",
    background: {
      default: "#ffffff",
      lightgrey: "#f1f3f5",
      darkgrey: "#787878",
      dark: "rgba(0, 0, 0, 0.5)",
      menuItemActive: "#A65462",
      filterItemActive: "#1C2834",
    },

    border: "#E0E2E6",
  },
  typography: {
    fontFamily: "Inter",
    h6: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
      color: "#337083",
    },
    h5: {
      fontSize: "20px",
      lineHeight: "28px",
      fontWeight: 700,
      color: "#000000",
    },
    h2: {
      fontSize: "26px",
      lineHeight: "28px",
      fontWeight: 700,
      color: "#1C2834",
    },
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
    body2: {
      fontSize: "16px",
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
          fontFamily: "Inter",
          fontWeight: "500",
          textTransform: "none",
          whiteSpace: "nowrap",
          minWidth: "auto",
          marginLeft: "5px",
          padding: "8px 12px",
          borderRadius: "4px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#337083",
          "&:hover": {
            backgroundColor: "#295969",
          },
          "&:focus-visible": {
            backgroundColor: "#295969",
            boxShadow: "0px 0px 0px 3px #8655F6",
          },
          "&:active": {
            backgroundColor: "#1F444F",
          },
          "&:disabled": {
            backgroundColor: "#C1D3D9",
          },
        },
        outlined: {
          color: "#337083",
          backgroundColor: "#FFFFFF",
          "&:hover": {
            color: "#295969",
            backgroundColor: "#D6E2E6",
          },
          "&:focus-visible": {
            color: "#295969",
            backgroundColor: "#D6E2E6",
            boxShadow: "0px 0px 0px 3px #8655F6",
          },
          "&:active": {
            color: "#1F444F",
            backgroundColor: "#ADC6CD",
          },
          "&:disabled": {
            backgroundColor: "#FFFFFF",
            color: "#C1D3D9",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "& .MuiTouchRipple-root": {
            display: "none",
          },
        },
        colorPrimary: {
          backgroundColor: "#337083",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#295969",
          },
          "&:focus-visible": {
            backgroundColor: "#295969",
            boxShadow: "0px 0px 0px 3px #8655F6",
          },
          "&:active": {
            backgroundColor: "#1F444F",
          },
          "&:disabled": {
            backgroundColor: "#C1D3D9",
          },
        },
        colorError: {
          "&:hover": {
            color: "#801519",
            backgroundColor: "rgba(0, 0, 0, 0)",
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: ArrowDownIcon,
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            backgroundColor: "#F8F9FA",
          },
          "& .MuiFilledInput-root:hover:not(.Mui-disabled, .Mui-error):before": {
            borderColor: "#4FA7BC",
          },
          "& .MuiFilledInput-root:not(.Mui-error):before": {
            borderColor: "#4FA7BC",
          },
          "& .MuiFilledInput-root:not(.Mui-error):after": {
            borderColor: "#4FA7BC",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "Inter",
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "16px",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: "#FF0000",
          color: "#FFFFFF",
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: "16px",
          color: "#1c2834",
        },
      },
    },
  },
});
