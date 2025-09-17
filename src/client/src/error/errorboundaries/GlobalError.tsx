import { FC } from "react";
import { useTranslation } from "react-i18next";
import { FallbackComponent } from "./FallbackComponent.tsx";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export const GlobalError: FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  return <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} title={t("globalErrorMessage")} />;
};
