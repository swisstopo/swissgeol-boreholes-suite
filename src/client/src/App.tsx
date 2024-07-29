import React from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
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
import { PromptProvider } from "./components/prompt/promptContext.tsx";
import { Prompt } from "./components/prompt/prompt.tsx";
import { BasemapProvider } from "./components/basemapSelector/basemapContext.tsx";
import { FilterProvider } from "./components/filter/filterContext.tsx";
import HeaderComponent from "./commons/menu/headerComponent.tsx";
import { Box } from "@mui/material";
import { DetailPage } from "./pages/detailPage.tsx";

const queryClient = new QueryClient();

class App extends React.Component {
  handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "none";
    }
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
      <ThemeProvider theme={theme}>
        <DataLoader>
          <AcceptTerms>
            <AlertProvider>
              <AlertBanner />
              <PromptProvider>
                <Prompt />
                <DataCardProvider>
                  <BasemapProvider>
                    <FilterProvider>
                      <QueryClientProvider client={queryClient}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                          }}>
                          <HeaderComponent />
                          <Router>
                            <Switch>
                              <Route render={props => <SettingCmp {...props} />} key={1} path={"/setting"} />
                              <Route exact={false} path={"/:id"} render={() => <DetailPage />} />
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
                        </Box>
                        <ReactQueryDevtools />
                      </QueryClientProvider>
                    </FilterProvider>
                  </BasemapProvider>
                </DataCardProvider>
              </PromptProvider>
            </AlertProvider>
          </AcceptTerms>
        </DataLoader>
      </ThemeProvider>
    );
  }
}

export default App;
