import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./AppTheme";
import { AlertBanner } from "./components/alert/alertBanner";
import { AlertProvider } from "./components/alert/alertContext";
import { BasemapProvider } from "./components/basemapSelector/basemapContext";
import { DataCardProvider } from "./components/dataCard/dataCardContext";
import HeaderComponent from "./components/header/headerComponent";
import { Prompt } from "./components/prompt/prompt";
import { PromptProvider } from "./components/prompt/promptContext";
import { AppBox } from "./components/styledComponents";
import { DetailProvider } from "./pages/detail/detailContext";
import { DetailPage } from "./pages/detail/detailPage";
import { LabelingProvider } from "./pages/detail/labeling/labelingContext";
import { OverviewProvider } from "./pages/overview/overViewContext";
import { OverviewPage } from "./pages/overview/overviewPage";
import { FilterProvider } from "./pages/overview/sidePanelContent/filter/filterContext";
import { DataLoader } from "./pages/settings/dataLoader";
import { SettingsPage } from "./pages/settings/settingsPage";
import { AcceptTerms } from "./term/accept";
import { AnalyticsProvider } from "./term/analyticsContext.tsx";

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
              color: "rgb(28, 40, 52)",
            },
          }}
        />
        <DataLoader>
          <AnalyticsProvider>
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
                                <Routes>
                                  <Route path="/setting/*" element={<SettingsPage />} />
                                  <Route
                                    path="/:id/*"
                                    element={
                                      <LabelingProvider>
                                        <DetailProvider>
                                          <DetailPage />
                                        </DetailProvider>
                                      </LabelingProvider>
                                    }
                                  />
                                  <Route path="/" element={<OverviewPage />} />
                                  <Route path="*" element={<Navigate to="/" />} />
                                </Routes>
                              </Router>
                            </AppBox>
                          </QueryClientProvider>
                        </OverviewProvider>
                      </FilterProvider>
                    </BasemapProvider>
                  </DataCardProvider>
                </PromptProvider>
              </AlertProvider>
            </AcceptTerms>
          </AnalyticsProvider>
        </DataLoader>
      </ThemeProvider>
    );
  }
}

export default App;
