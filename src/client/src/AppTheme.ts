import { AppThemePalette, createTheme, Shadows } from "@mui/material/styles";
import { Spacing } from "@mui/system";
import { ChevronDown } from "lucide-react";

const defaultTheme = createTheme();

const themePalette: AppThemePalette = {
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
    mainTransparent: "rgba(91, 33, 182, 0.2)",
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
  transparent: "rgba(0,0,0,0)",
  buttonStates: {
    contained: {
      hoverOrFocus: {
        backgroundColor: "#295969",
      },
      active: {
        backgroundColor: "#1F444F",
      },
      disabled: {
        backgroundColor: "#C1D3D9",
      },
    },
    outlined: {
      hoverOrFocus: {
        color: "#2F4356",
        backgroundColor: "#D6E2E6",
      },
      active: {
        color: "#2F4356",
        backgroundColor: "#ADC6CD",
      },
      disabled: {
        color: "#828E9A",
        backgroundColor: "#ffffff",
      },
    },
  },

  border: "#E0E2E6",
};

const themeBoxShadows: Shadows = [...defaultTheme.shadows];
const themeSpacing: Spacing = defaultTheme.spacing;

themeBoxShadows[1] =
  "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important";
themeBoxShadows[2] = "0 1px 3px #DFE4E9, 0 1px 2px #DFE4E9";
themeBoxShadows[3] = "4px 4px 2px #DFE4E9"; // basemapSelector
themeBoxShadows[4] = "2px 6px 6px 0px #DFE4E9";
themeBoxShadows[5] = "0px 2px 1px -1px #DFE4E9, 0px 1px 1px 0px #DFE4E9, 0px 1px 3px 0px #DFE4E9"; // tabContentBox
themeBoxShadows[6] = "-1px 0 0 #DFE4E9"; // border for description layers
themeBoxShadows[7] = "inset -1px 0 0 #DFE4E9, inset 0 -1px 0 #DFE4E9"; // border for description layers

const focusShadow = "0px 0px 0px 3px #8655F6";

export const theme = createTheme({
  palette: themePalette,
  shadows: themeBoxShadows,
  spacing: themeSpacing,
  typography: {
    fontFamily: "Inter",
    h6: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
      color: themePalette.primary.main,
    },
    h5: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 700,
      color: themePalette.neutral.contrastText,
    },
    h4: {
      fontSize: "20px",
      lineHeight: "28px",
      fontWeight: 700,
      color: themePalette.neutral.contrastText,
    },
    h2: {
      fontSize: "26px",
      lineHeight: "28px",
      fontWeight: 700,
      color: themePalette.secondary.main,
    },
    h1: {
      fontSize: "32px",
      lineHeight: "44px",
      fontWeight: 400,
      color: "#000000",
    },
    subtitle1: {
      fontSize: "13px",
      color: themePalette.neutral.contrastText,
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
      color: themePalette.neutral.contrastText,
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
          padding: `${themeSpacing(1)} ${themeSpacing(1.5)}`,
          borderRadius: themeSpacing(0.5),
          boxShadow: themeBoxShadows[0],
          "&:hover": {
            boxShadow: themeBoxShadows[0],
          },
          "&:focus-visible": {
            boxShadow: focusShadow,
          },
          variants: [
            {
              props: { variant: "contained", color: "primary" },
              style: {
                backgroundColor: themePalette.primary.main,
                "&:hover": {
                  backgroundColor: themePalette.buttonStates.contained.hoverOrFocus.backgroundColor,
                },
                "&:focus-visible": {
                  backgroundColor: themePalette.buttonStates.contained.hoverOrFocus.backgroundColor,
                },
                "&:active, &.Mui-active": {
                  backgroundColor: themePalette.buttonStates.contained.active.backgroundColor,
                },
                "&:disabled": {
                  backgroundColor: themePalette.buttonStates.contained.disabled.backgroundColor,
                },
              },
            },
            {
              props: { variant: "outlined", color: "primary" },
              style: {
                color: themePalette.primary.main,
                backgroundColor: themePalette.background.default,
                "&:hover": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                },
                "&:focus-visible": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                },
                "&:active, &.Mui-active": {
                  color: themePalette.buttonStates.outlined.active.color,
                  backgroundColor: themePalette.buttonStates.outlined.active.backgroundColor,
                },
                "&:disabled": {
                  color: themePalette.buttonStates.outlined.disabled.color,
                  backgroundColor: themePalette.buttonStates.outlined.disabled.backgroundColor,
                },
              },
            },
            {
              props: { variant: "outlined", color: "secondary" },
              style: {
                backgroundColor: themePalette.transparent,
                color: themePalette.primary.main,
                borderColor: themePalette.primary.main,
                "&:hover": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                  borderColor: themePalette.buttonStates.outlined.hoverOrFocus.color,
                },
                "&:focus-visible": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                  borderColor: themePalette.buttonStates.outlined.hoverOrFocus.color,
                },
                "&:active, &.Mui-active": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.active.backgroundColor,
                  borderColor: themePalette.buttonStates.outlined.hoverOrFocus.color,
                },
                "&:disabled": {
                  backgroundColor: themePalette.transparent,
                  borderColor: themePalette.buttonStates.outlined.disabled.color,
                },
              },
            },
            {
              props: { variant: "text", color: "primary" },
              style: {
                backgroundColor: themePalette.background.default,
                color: themePalette.primary.main,
                "&:hover": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                },
                "&:focus-visible": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                },
                "&:active, &.Mui-active": {
                  color: themePalette.buttonStates.outlined.active.color,
                  backgroundColor: themePalette.buttonStates.outlined.active.backgroundColor,
                },
                "&:disabled": {
                  backgroundColor: themePalette.background.default,
                },
              },
            },
            {
              props: { variant: "text", color: "secondary" },
              style: {
                backgroundColor: themePalette.transparent,
                color: themePalette.primary.main,
                "&:hover": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                },
                "&:focus-visible": {
                  color: themePalette.buttonStates.outlined.hoverOrFocus.color,
                  backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
                },
                "&:active, &.Mui-active": {
                  color: themePalette.buttonStates.outlined.active.color,
                  backgroundColor: themePalette.buttonStates.outlined.active.backgroundColor,
                },
                "&:disabled": {
                  backgroundColor: themePalette.transparent,
                },
              },
            },
          ],
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: themePalette.background.lightgrey,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #ACB4BD",
          boxShadow: themeBoxShadows[0],
          borderRadius: `${themeSpacing(1)} !important`,
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
          backgroundColor: themePalette.primary.main,
          color: themePalette.primary.contrastText,
          "&:hover": {
            backgroundColor: themePalette.buttonStates.contained.hoverOrFocus.backgroundColor,
          },
          "&:focus-visible": {
            backgroundColor: themePalette.buttonStates.contained.hoverOrFocus.backgroundColor,
            boxShadow: focusShadow,
          },
          "&:active": {
            backgroundColor: themePalette.buttonStates.contained.active.backgroundColor,
          },
          "&:disabled": {
            backgroundColor: themePalette.buttonStates.contained.disabled.backgroundColor,
          },
        },
        colorError: {
          "&:hover": {
            color: themePalette.error.dark,
            backgroundColor: themePalette.transparent,
          },
        },
        colorAi: {
          color: themePalette.primary.contrastText,
          background: `linear-gradient(${themePalette.ai.main}, ${themePalette.ai.mainEnd})`,
          "&:hover": {
            background: `linear-gradient(${themePalette.ai.active}, ${themePalette.ai.activeEnd})`,
          },
          "&:focus-visible": {
            background: "linear-gradient(#4338CA, #BF1F25)",
            boxShadow: focusShadow,
          },
          "&:active, &.Mui-active": {
            background: `linear-gradient(${themePalette.ai.active}, ${themePalette.ai.activeEnd})`,
          },
          "&:disabled": {
            background: themePalette.action.disabled,
          },
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: themeBoxShadows[1],
          backgroundColor: themePalette.background.default,
          height: "44px",

          "& .MuiButtonGroup-grouped": {
            minWidth: "36px",
            minHeight: "36px",
            border: "none",
            borderRadius: themeSpacing(0.5),
            padding: themeSpacing(1),

            "&.Mui-disabled": {
              border: "none",
            },
          },
          "&.MuiButtonGroup-vertical": {
            height: "auto",
            width: "44px",
            "& .MuiButtonGroup-grouped": {
              padding: themeSpacing(1),
              margin: themeSpacing(0.5),
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: themePalette.background.default,
          boxShadow: themeBoxShadows[1],
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: "0",
          borderRadius: `${themeSpacing(0.5)} !important`,
          margin: themeSpacing(0.5),
          padding: "7px",
          color: themePalette.primary.main,
          "&.Mui-selected": {
            color: themePalette.buttonStates.outlined.hoverOrFocus.color,
            backgroundColor: themePalette.buttonStates.outlined.hoverOrFocus.backgroundColor,
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: ChevronDown,
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderRadius: themeSpacing(0.5),
          flex: "1",

          "&.readonly": {
            pointerEvents: "none",
          },

          "&.ai .MuiOutlinedInput-notchedOutline": {
            borderColor: `${themePalette.ai.main} !important`,
            borderWidth: "3px",
          },
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        shrink: true,
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        notched: true,
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
          color: themePalette.primary.contrastText,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingTop: themeSpacing(3),
          paddingBottom: themeSpacing(2),
          borderBottom: "1px solid " + themePalette.border,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid " + themePalette.border,
          padding: themeSpacing(3),
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: "16px",
          color: themePalette.secondary.main,
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
          backgroundColor: themePalette.secondary.main,
          color: themePalette.primary.contrastText,
        },
      },
    },
  },
});
