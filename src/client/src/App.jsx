import React from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HomeComponent from "./pages/home/homeComponent";
import EditorComponent from "./pages/editor/editorComponent";
import SettingCmp from "./pages/settings/settingCmp";
import DataLoader from "./pages/settings/dataLoader";
import AcceptTerms from "./pages/term/accept";
import { AlertProvider } from "./components/alert/alertContext";
import { AlertBanner } from "./components/alert/alertBanner";

const queryClient = new QueryClient();

export const theme = createTheme({
  palette: {
    primary: {
      main: "#212121",
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

class App extends React.Component {
  handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "none";
  };

  componentDidMount() {
    // Prevent showing the 'copy' cursor when dragging over the page.
    document.addEventListener("dragover", this.handleDragOver);

    // Get the scrollbar width
    var scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    this.props.setScrollbarWidth(scrollbarWidth + "px");
    // Delete the DIV
    document.body.removeChild(scrollDiv);
  }

  componentWillUnmount() {
    document.removeEventListener("dragover", this.handleDragOver);
  }

  render() {
    const { loader } = this.props;
    let mode = "viewer";
    return loader.isReady === false ? (
      <DataLoader />
    ) : loader.terms === false ? (
      <AcceptTerms />
    ) : (
      <AlertProvider>
        <AlertBanner />
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <Router>
              <Switch>
                <Route
                  render={props => {
                    mode = "editor";
                    return <EditorComponent {...props} />;
                  }}
                  exact={false}
                  key={0}
                  path={"/editor"}
                />
                <Route
                  render={props => <SettingCmp {...props} mode={mode} />}
                  exact={true}
                  key={1}
                  path={"/setting/:id"}
                />
                <Route
                  render={props => {
                    mode = "viewer";
                    return <HomeComponent {...props} />;
                  }}
                  key={2}
                  path={"/"}
                />
                <Route
                  component={r => (
                    <Redirect
                      to={{
                        pathname: "/",
                      }}
                    />
                  )}
                />
              </Switch>
            </Router>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </ThemeProvider>
      </AlertProvider>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    loader: state.dataLoaderState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    setScrollbarWidth: w => {
      dispatch({
        type: "SETTING_SCROLLBAR_WIDTH",
        width: w,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
