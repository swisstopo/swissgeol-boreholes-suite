import { FC, PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Language, SwissgeolCoreI18n } from "@swissgeol/ui-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { createQueryClient } from "./api/queryClient.ts";
import { theme } from "./AppTheme";
import { BoreholesAuthProvider } from "./auth/BoreholesAuthProvider.tsx";
import { AlertBanner } from "./components/alert/alertBanner";
import { AlertContext, AlertProvider } from "./components/alert/alertContext";
import { BasemapProvider } from "./components/basemapSelector/basemapContext";
import { DataCardProvider } from "./components/dataCard/dataCardContext";
import { DevBranchBadge } from "./components/devBranchBadge/DevBranchBadge";
import HeaderComponent from "./components/header/headerComponent";
import { Prompt } from "./components/prompt/prompt";
import { PromptProvider } from "./components/prompt/promptContext";
import { AppBox } from "./components/styledComponents";
import {
  DetailError,
  GlobalError,
  OverviewError,
  RouteErrorBoundary,
  SettingsError,
} from "./error/Errorboundaries.tsx";
import i18n from "./i18n";
import { DetailPage } from "./pages/detail/detailPage";
import { EditStateProvider } from "./pages/detail/editStateContext.tsx";
import { LabelingProvider } from "./pages/detail/labeling/labelingContext";
import { SaveProvider } from "./pages/detail/saveContext.tsx";
import { BoreholeUrlParamsProvider } from "./pages/overview/boreholeUrlParamsProvider.tsx";
import { OverviewPage } from "./pages/overview/overviewPage";
import { PolygonFilterProvider } from "./pages/overview/sidePanelContent/filter/polygonFilterContext.tsx";
import { UserWorkgroupsProvider } from "./pages/overview/UserWorkgroupsContext.tsx";
import { SettingsPage } from "./pages/settings/settingsPage";
import { AcceptTerms } from "./term/accept";
import { AnalyticsProvider } from "./term/analyticsContext";

const router = createBrowserRouter([
  {
    path: "/setting/*",
    element: (
      <RouteErrorBoundary fallback={SettingsError}>
        <SettingsPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: "/:id/*",
    element: (
      <RouteErrorBoundary fallback={DetailError}>
        <LabelingProvider>
          <EditStateProvider>
            <SaveProvider>
              <DetailPage />
            </SaveProvider>
          </EditStateProvider>
        </LabelingProvider>
      </RouteErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <RouteErrorBoundary fallback={OverviewError}>
        <NuqsAdapter>
          <BoreholeUrlParamsProvider>
            <OverviewPage />
          </BoreholeUrlParamsProvider>
        </NuqsAdapter>
      </RouteErrorBoundary>
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

  // Use refs so the QueryClient callbacks always access the latest values
  // without recreating the QueryClient on every language change.
  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;

  const tRef = useRef(t);
  tRef.current = t;

  const queryClient = useMemo(
    () =>
      createQueryClient({
        showAlert: (message, severity) => showAlertRef.current(message, severity),
        translate: key => tRef.current(key),
        retryQueries: !isCypress,
      }),
    [isCypress],
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
            color: theme.palette.secondary.main,
          },
        }}
      />
      <AlertProvider>
        <AlertBanner />
        {import.meta.env.DEV && <DevBranchBadge />}
        <ErrorBoundary FallbackComponent={GlobalError}>
          <QueryClientInitializer>
            <BoreholesAuthProvider router={router}>
              <AnalyticsProvider>
                <AcceptTerms>
                  <UserWorkgroupsProvider>
                    <PromptProvider>
                      <Prompt />
                      <DataCardProvider>
                        <BasemapProvider>
                          <PolygonFilterProvider>
                            <ReactQueryDevtools buttonPosition={"top-left"} initialIsOpen={false} />
                            <AppBox>
                              <HeaderComponent />
                              <RouterProvider router={router} />
                            </AppBox>
                          </PolygonFilterProvider>
                        </BasemapProvider>
                      </DataCardProvider>
                    </PromptProvider>
                  </UserWorkgroupsProvider>
                </AcceptTerms>
              </AnalyticsProvider>
            </BoreholesAuthProvider>
          </QueryClientInitializer>
        </ErrorBoundary>
      </AlertProvider>
    </ThemeProvider>
  );
};

export default App;
