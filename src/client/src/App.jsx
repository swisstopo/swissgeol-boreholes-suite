import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./AppTheme.js";
import HomeComponent from "./pages/home/homeComponent";
import EditorComponent from "./pages/editor/editorComponent";
import SettingCmp from "./pages/settings/settingCmp";
import DataLoader from "./pages/settings/dataLoader";
import AcceptTerms from "./pages/term/accept";
import { AlertProvider } from "./components/alert/alertContext";
import { AlertBanner } from "./components/alert/alertBanner";
import { DataCardProvider } from "./components/dataCard/dataCardContext.jsx";

const queryClient = new QueryClient();

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
    let mode = "viewer";
    return (
      <DataLoader>
        <AcceptTerms>
          <AlertProvider>
            <AlertBanner />
            <DataCardProvider>
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
                        component={() => (
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
            </DataCardProvider>
          </AlertProvider>
        </AcceptTerms>
      </DataLoader>
    );
  }
}

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

const ConnectedApp = connect(null, mapDispatchToProps)(App);
export default ConnectedApp;
