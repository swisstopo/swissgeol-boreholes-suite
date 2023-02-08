import React from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HomeComponent from "./pages/home/homeComponent";
import EditorComponent from "./pages/editor/editorComponent";
import SettingCmp from "./pages/settings/settingCmp";
import DataLoader from "./pages/settings/dataLoader";
import AcceptTerms from "./pages/term/accept";
import { AlertProvider } from "./commons/alert/alertContext";
import { AlertBanner } from "./commons/alert/alertBanner";

const cpaths = [
  {
    path: process.env.PUBLIC_URL + "/editor",
    exact: false,
    body: EditorComponent,
  },
  {
    path: process.env.PUBLIC_URL + "/setting/:id",
    exact: true,
    body: SettingCmp,
  },
  {
    path: process.env.PUBLIC_URL + "/",
    body: HomeComponent,
  },
];
const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: "#007CC3",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: "Lato",
    subtitle2: {
      fontSize: "0.8em",
      color: "#787878",
      lineHeight: "1em",
    },
  },
});

class App extends React.Component {
  componentDidMount() {
    // Get the scrollbar width
    var scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    this.props.setScrollbarWidth(scrollbarWidth + "px");
    // Delete the DIV
    document.body.removeChild(scrollDiv);
  }

  render() {
    const { loader } = this.props;
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
                {cpaths.map((route, index) => {
                  return (
                    <Route
                      component={route.body}
                      exact={route.exact}
                      key={index}
                      path={route.path}
                    />
                  );
                })}
                <Route
                  component={r => (
                    <Redirect
                      to={{
                        pathname: process.env.PUBLIC_URL + "/",
                      }}
                    />
                  )}
                />
              </Switch>
            </Router>
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
