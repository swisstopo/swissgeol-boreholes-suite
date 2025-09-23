import { FC, PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Language, SwissgeolCoreI18n } from "@swissgeol/ui-core";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "./api/apiInterfaces.ts";
import { theme } from "./AppTheme";
import { BdmsAuthProvider } from "./auth/BdmsAuthProvider.tsx";
import { AlertBanner } from "./components/alert/alertBanner";
import { AlertContext, AlertProvider } from "./components/alert/alertContext";
import { BasemapProvider } from "./components/basemapSelector/basemapContext";
import { DataCardProvider } from "./components/dataCard/dataCardContext";
import HeaderComponent from "./components/header/headerComponent";
import { Prompt } from "./components/prompt/prompt";
import { PromptProvider } from "./components/prompt/promptContext";
import { AppBox } from "./components/styledComponents";
import { DetailError, GlobalError, OverviewError, SettingsError } from "./error/Errorboundaries.tsx";
import i18n from "./i18n";
import { DetailPage } from "./pages/detail/detailPage";
import { EditStateProvider } from "./pages/detail/editStateContext.tsx";
import { LabelingProvider } from "./pages/detail/labeling/labelingContext";
import { SaveProvider } from "./pages/detail/saveContext.tsx";
import { OverviewProvider } from "./pages/overview/overViewContext";
import { OverviewPage } from "./pages/overview/overviewPage";
import { FilterProvider } from "./pages/overview/sidePanelContent/filter/filterContext";
import { UserWorkgroupsProvider } from "./pages/overview/UserWorkgroupsContext.tsx";
import { DataLoader } from "./pages/settings/dataLoader";
import { SettingsPage } from "./pages/settings/settingsPage";
import { AcceptTerms } from "./term/accept";
import { AnalyticsProvider } from "./term/analyticsContext";

const router = createBrowserRouter([
  {
    path: "/setting/*",
    element: (
      <ErrorBoundary FallbackComponent={SettingsError}>
        <SettingsPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "/:id/*",
    element: (
      <ErrorBoundary FallbackComponent={DetailError}>
        <LabelingProvider>
          <EditStateProvider>
            <SaveProvider>
              <DetailPage />
            </SaveProvider>
          </EditStateProvider>
        </LabelingProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <ErrorBoundary FallbackComponent={OverviewError}>
        <OverviewPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const QueryClientInitializer: FC<PropsWithChildren> = ({ children }) => {
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();
  const isCypress = !!globalThis.Cypress;

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: isCypress ? false : 3,
            throwOnError: (error, query) => {
              // If there is no cached data for a query, we want to throw an error that will be caught by the error boundary.
              // The closest error boundary's FallbackComponent will be displayed.
              return typeof query.state.data === "undefined";
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (typeof query.state.data !== "undefined" && !(error instanceof ApiError)) {
              // If there is cached data available for a query, we want to show the cached data to the user.
              // An alert will be shown to inform the user that the data is not up-to-date.
              showAlert(t("dataNotUpToDateError"), "error");
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: error => {
            if (!(error instanceof ApiError)) {
              // An alert will be shown to inform the user that the action was not successful.
              showAlert(t("errorMutationNotSuccessfull"), "error");
            }
          },
        }),
      }),
    [showAlert, t, isCypress],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const App = () => {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleLanguageChange = (language: Language) => {
    SwissgeolCoreI18n.setLanguage(language);
  };

  useEffect(() => {
    // Prevent showing the 'copy' cursor when dragging over the page.
    document.addEventListener("dragover", handleDragOver);
    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

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
      <AlertProvider>
        <AlertBanner />
        <ErrorBoundary FallbackComponent={GlobalError}>
          <QueryClientInitializer>
            <BdmsAuthProvider router={router}>
              <DataLoader>
                <AnalyticsProvider>
                  <AcceptTerms>
                    <UserWorkgroupsProvider>
                      <PromptProvider>
                        <Prompt />
                        <DataCardProvider>
                          <BasemapProvider>
                            <FilterProvider>
                              <OverviewProvider>
                                <ReactQueryDevtools buttonPosition={"top-right"} initialIsOpen={false} />
                                <AppBox>
                                  <HeaderComponent />
                                  <RouterProvider router={router} />
                                </AppBox>
                              </OverviewProvider>
                            </FilterProvider>
                          </BasemapProvider>
                        </DataCardProvider>
                      </PromptProvider>
                    </UserWorkgroupsProvider>
                  </AcceptTerms>
                </AnalyticsProvider>
              </DataLoader>
            </BdmsAuthProvider>
          </QueryClientInitializer>
        </ErrorBoundary>
      </AlertProvider>
    </ThemeProvider>
  );
};

export default App;
