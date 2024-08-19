import React from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./AppTheme";
import OverviewPage from "./pages/overview/overviewPage";
import SettingsPage from "./pages/settings/settingsPage";
import { DataLoader } from "./pages/settings/dataLoader";
import { AcceptTerms } from "./term/accept";
import { AlertProvider } from "./components/alert/alertContext";
import { AlertBanner } from "./components/alert/alertBanner";
import { DataCardProvider } from "./components/dataCard/dataCardContext.jsx";
import { PromptProvider } from "./components/prompt/promptContext.tsx";
import { Prompt } from "./components/prompt/prompt.tsx";
import { BasemapProvider } from "./components/basemapSelector/basemapContext.tsx";
import { FilterProvider } from "./pages/overview/sidePanelContent/filter/filterContext.tsx";
import HeaderComponent from "./components/header/headerComponent.tsx";
import { AppBox } from "./components/styledComponents.ts";
import { DetailPage } from "./pages/detail/detailPage.tsx";

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
                        <AppBox>
                          <HeaderComponent />
                          <Router>
                            <Switch>
                              <Route render={props => <SettingsPage {...props} />} key={0} path={"/setting"} />
                              <Route exact={false} key={1} path={"/:id"} render={() => <DetailPage />} />
                              <Route
                                render={props => {
                                  return <OverviewPage {...props} />;
                                }}
                                exact={false}
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
                        </AppBox>
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
