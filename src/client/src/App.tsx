import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./AppTheme";
import { AlertBanner } from "./components/alert/alertBanner";
import { AlertProvider } from "./components/alert/alertContext";
import { BasemapProvider } from "./components/basemapSelector/basemapContext.tsx";
import { DataCardProvider } from "./components/dataCard/dataCardContext.tsx";
import HeaderComponent from "./components/header/headerComponent.tsx";
import { Prompt } from "./components/prompt/prompt.tsx";
import { PromptProvider } from "./components/prompt/promptContext.tsx";
import { AppBox } from "./components/styledComponents.ts";
import { DetailProvider } from "./pages/detail/detailContext.tsx";
import { DetailPage } from "./pages/detail/detailPage.tsx";
import { LabelingProvider } from "./pages/detail/labeling/labelingContext.tsx";
import { OverviewProvider } from "./pages/overview/overViewContext.tsx";
import { OverviewPage } from "./pages/overview/overviewPage.tsx";
import { FilterProvider } from "./pages/overview/sidePanelContent/filter/filterContext.tsx";
import { DataLoader } from "./pages/settings/dataLoader";
import { SettingsPage } from "./pages/settings/settingsPage.tsx";
import { AcceptTerms } from "./term/accept";

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
        <GlobalStyles
          styles={{
            body: {
              fontFamily: theme.typography.fontFamily,
            },
          }}
        />
        <DataLoader>
          <AcceptTerms>
            <AlertProvider>
              <AlertBanner />
              <PromptProvider>
                <Prompt />
                <DataCardProvider>
                  <BasemapProvider>
                    <FilterProvider>
                      <OverviewProvider>
                        <QueryClientProvider client={queryClient}>
                          <AppBox>
                            <HeaderComponent />
                            <Router>
                              <Switch>
                                <Route key={0} path={"/setting"} render={() => <SettingsPage />} />
                                <Route
                                  exact={false}
                                  key={1}
                                  path={"/:id"}
                                  render={() => (
                                    <LabelingProvider>
                                      <DetailProvider>
                                        <DetailPage />
                                      </DetailProvider>
                                    </LabelingProvider>
                                  )}
                                />
                                <Route component={OverviewPage} exact={false} key={2} path={"/"} />
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
                      </OverviewProvider>
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
