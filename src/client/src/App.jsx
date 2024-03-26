import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./AppTheme.js";
import EditorComponent from "./pages/editor/editorComponent";
import SettingCmp from "./pages/settings/settingCmp";
import { DataLoader } from "./pages/settings/dataLoader";
import AcceptTerms from "./pages/term/accept";
import { AlertProvider } from "./components/alert/alertContext";
import { AlertBanner } from "./components/alert/alertBanner";
import { DataCardProvider } from "./components/dataCard/dataCardContext.jsx";
import { PromptProvider } from "./components/prompt/promptContext.jsx";
import { Prompt } from "./components/prompt/prompt";

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
    return (
      <DataLoader>
        <AcceptTerms>
          <AlertProvider>
            <AlertBanner />
            <PromptProvider>
              <Prompt />
              <DataCardProvider>
                <ThemeProvider theme={theme}>
                  <QueryClientProvider client={queryClient}>
                    <Router>
                      <Switch>
                        <Route
                          render={props => {
                            return <EditorComponent {...props} />;
                          }}
                          exact={false}
                          key={0}
                          path={"/editor"}
                        />
                        <Route render={() => <SettingCmp />} exact={true} key={1} path={"/setting/:id"} />
                        <Redirect exact from="/" to="/editor" />
                        <Route
                          component={() => (
                            <Redirect
                              to={{
                                pathname: "/editor",
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
            </PromptProvider>
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
