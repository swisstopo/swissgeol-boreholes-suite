import { createTheme } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";

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
    ai: {
      background: "#46596B",
      main: "#5B21B6",
      mainEnd: "#8B5CF6",
      active: "#4F46E5",
      activeEnd: "#E53940",
      contrastText: "#ffffff",
    },
    boxShadow: "#DFE4E9",
    background: {
      default: "#ffffff",
      lightgrey: "#f1f3f5",
      darkgrey: "#787878",
      dark: "rgba(0, 0, 0, 0.5)",
      menuItemActive: "#A65462",
      filterItemActive: "#1C2834",
      listItemActive: "#DFE4E9",
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
          padding: "8px 12px",
          borderRadius: "4px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
          "&:focus-visible": {
            boxShadow: "0px 0px 0px 3px #8655F6",
          },
          variants: [
            {
              props: { variant: "contained", color: "primary" },
              style: {
                backgroundColor: "#337083",
                "&:hover": {
                  backgroundColor: "#295969",
                },
                "&:focus-visible": {
                  backgroundColor: "#295969",
                },
                "&:active, &.Mui-active": {
                  backgroundColor: "#1F444F",
                },
                "&:disabled": {
                  backgroundColor: "#C1D3D9",
                },
              },
            },
            {
              props: { variant: "outlined", color: "primary" },
              style: {
                color: "#337083",
                backgroundColor: "#FFFFFF",
                "&:hover": {
                  color: "#295969",
                  backgroundColor: "#D6E2E6",
                },
                "&:focus-visible": {
                  color: "#295969",
                  backgroundColor: "#D6E2E6",
                },
                "&:active, &.Mui-active": {
                  color: "#1F444F",
                  backgroundColor: "#ADC6CD",
                },
                "&:disabled": {
                  backgroundColor: "#FFFFFF",
                },
              },
            },
            {
              props: { variant: "outlined", color: "secondary" },
              style: {
                backgroundColor: "rgba(0,0,0,0)",
                color: "#337083",
                borderColor: "#337083",
                "&:hover": {
                  color: "#2F4356",
                  backgroundColor: "#D6E2E6",
                  borderColor: "#2F4356",
                },
                "&:focus-visible": {
                  color: "#295969",
                  backgroundColor: "#D6E2E6",
                  borderColor: "#295969",
                },
                "&:active, &.Mui-active": {
                  color: "#1F444F",
                  backgroundColor: "#ADC6CD",
                  borderColor: "#1F444F",
                },
                "&:disabled": {
                  backgroundColor: "rgba(0,0,0,0)",
                  borderColor: "#828E94",
                },
              },
            },
            {
              props: { variant: "text", color: "primary" },
              style: {
                backgroundColor: "#FFFFFF",
                color: "#337083",
                "&:hover": {
                  color: "#2F4356",
                  backgroundColor: "#D6E2E6",
                },
                "&:focus-visible": {
                  color: "#295969",
                  backgroundColor: "#D6E2E6",
                },
                "&:active, &.Mui-active": {
                  color: "#1F444F",
                  backgroundColor: "#ADC6CD",
                },
                "&:disabled": {
                  backgroundColor: "#FFFFFF",
                },
              },
            },
            {
              props: { variant: "text", color: "secondary" },
              style: {
                backgroundColor: "rgba(0,0,0,0)",
                color: "#337083",
                "&:hover": {
                  color: "#2F4356",
                  backgroundColor: "#D6E2E6",
                },
                "&:focus-visible": {
                  color: "#295969",
                  backgroundColor: "#D6E2E6",
                },
                "&:active, &.Mui-active": {
                  color: "#1F444F",
                  backgroundColor: "#ADC6CD",
                },
                "&:disabled": {
                  backgroundColor: "rgba(0,0,0,0)",
                },
              },
            },
          ],
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
        colorAi: {
          color: "#ffffff",
          background: "linear-gradient(#5B21B6, #8B5CF6)",
          "&:hover": {
            background: "linear-gradient(#4F46E5, #E53940)",
          },
          "&:focus-visible": {
            background: "linear-gradient(#4F46E5, #E53940)",
            boxShadow: "0px 0px 0px 3px #8655F6",
          },
          "&:active": {
            background: "linear-gradient(#4F46E5, #E53940)",
          },
          "&:disabled": {
            background: "linear-gradient(#4F46E5, #E53940)",
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: "0",
          borderRadius: "4px !important",
          margin: "4px",
          padding: "7px",
          color: "#337083",
          "&.Mui-selected": {
            color: "#2F4356",
            backgroundColor: "#D6E2E6",
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: ChevronDown,
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
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: "13px",
          fontWeight: 700,
          padding: "3px",
          flex: 1,
          verticalAlign: "top",
        },
        body: {
          paddingRight: "3px",
          paddingLeft: "3px",
          flex: 1,
          fontSize: "13px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "12px",
          backgroundColor: "#1C2834",
          color: "#ffffff",
        },
      },
    },
  },
});
