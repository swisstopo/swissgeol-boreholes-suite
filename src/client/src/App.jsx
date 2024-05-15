import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./AppTheme";
import EditorComponent from "./pages/editor/editorComponent";
import SettingCmp from "./pages/settings/settingCmp";
import { DataLoader } from "./pages/settings/dataLoader";
import AcceptTerms from "./pages/term/accept";
import { AlertProvider } from "./components/alert/alertContext";
import { AlertBanner } from "./components/alert/alertBanner";
import { DataCardProvider } from "./components/dataCard/dataCardContext.jsx";
import { PromptProvider } from "./components/prompt/promptContext.jsx";
import { Prompt } from "./components/prompt/prompt";
import { BasemapProvider } from "./components/basemapSelector/basemapContext.tsx";

const queryClient = new QueryClient();

class App extends React.Component {
  handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "none";
  };

  componentDidMount() {
    // Prevent showing the 'copy' cursor when dragging over the page.
    document.addEventListener("dragover", this.handleDragOver);
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
                <BasemapProvider>
                  <ThemeProvider theme={theme}>
                    <QueryClientProvider client={queryClient}>
                      <Router>
                        <Switch>
                          <Route render={props => <SettingCmp {...props} />} key={1} path={"/setting"} />
                          <Route
                            render={props => {
                              return <EditorComponent {...props} />;
                            }}
                            exact={false}
                            key={0}
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
                </BasemapProvider>
              </DataCardProvider>
            </PromptProvider>
          </AlertProvider>
        </AcceptTerms>
      </DataLoader>
    );
  }
}

export default App;
