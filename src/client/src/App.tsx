import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Language, SwissgeolCoreI18n } from "@swissgeol/ui-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./AppTheme";
import { BdmsAuthProvider } from "./auth/BdmsAuthProvider.tsx";
import { AlertBanner } from "./components/alert/alertBanner";
import { AlertProvider } from "./components/alert/alertContext";
import { BasemapProvider } from "./components/basemapSelector/basemapContext";
import { DataCardProvider } from "./components/dataCard/dataCardContext";
import HeaderComponent from "./components/header/headerComponent";
import { Prompt } from "./components/prompt/prompt";
import { PromptProvider } from "./components/prompt/promptContext";
import { AppBox } from "./components/styledComponents";
import i18n from "./i18n";
import { DetailPage } from "./pages/detail/detailPage";
import { EditStateProvider } from "./pages/detail/editStateContext.tsx";
import { LabelingProvider } from "./pages/detail/labeling/labelingContext";
import { SaveProvider } from "./pages/detail/saveContext.tsx";
import { OverviewProvider } from "./pages/overview/overViewContext";
import { OverviewPage } from "./pages/overview/overviewPage";
import { FilterProvider } from "./pages/overview/sidePanelContent/filter/filterContext";
import { UserWorkgroupsProvider } from "./pages/overview/WorkgroupUserContext.tsx";
import { DataLoader } from "./pages/settings/dataLoader";
import { SettingsPage } from "./pages/settings/settingsPage";
import { AcceptTerms } from "./term/accept";
import { AnalyticsProvider } from "./term/analyticsContext";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/setting/*",
    element: <SettingsPage />,
  },
  {
    path: "/:id/*",
    element: (
      <LabelingProvider>
        <EditStateProvider>
          <SaveProvider>
            <DetailPage />
          </SaveProvider>
        </EditStateProvider>
      </LabelingProvider>
    ),
  },
  {
    path: "/",
    element: <OverviewPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

class App extends React.Component {
  handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "none";
    }
  };

  handleLanguageChange = (language: Language) => {
    SwissgeolCoreI18n.setLanguage(language);
  };

  componentDidMount() {
    // Prevent showing the 'copy' cursor when dragging over the page.
    document.addEventListener("dragover", this.handleDragOver);
    i18n.on("languageChanged", this.handleLanguageChange);
  }

  componentWillUnmount() {
    document.removeEventListener("dragover", this.handleDragOver);
    i18n.off("languageChanged", this.handleLanguageChange);
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
        <BdmsAuthProvider router={router}>
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
                          <UserWorkgroupsProvider>
                            <OverviewProvider>
                              <QueryClientProvider client={queryClient}>
                                <AppBox>
                                  <HeaderComponent />
                                  <RouterProvider router={router} />
                                </AppBox>
                              </QueryClientProvider>
                            </OverviewProvider>
                          </UserWorkgroupsProvider>
                        </FilterProvider>
                      </BasemapProvider>
                    </DataCardProvider>
                  </PromptProvider>
                </AlertProvider>
              </AcceptTerms>
            </AnalyticsProvider>
          </DataLoader>
        </BdmsAuthProvider>
      </ThemeProvider>
    );
  }
}

export default App;
