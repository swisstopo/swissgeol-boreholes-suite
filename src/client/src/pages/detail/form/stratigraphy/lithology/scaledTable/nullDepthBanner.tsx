import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@mui/material";

interface NullDepthBannerProps {
  hiddenCount: number;
}

// Warning shown above the scaled lithology view when one or more layers cannot be placed because
// their fromDepth/toDepth are null. Save-time validation prevents this for layers created in the
// UI, so the banner only surfaces for DB-side or import-side anomalies.
export const NullDepthBanner: FC<NullDepthBannerProps> = ({ hiddenCount }) => {
  const { t } = useTranslation();
  if (hiddenCount <= 0) return null;
  return (
    <Alert severity="warning" data-cy="null-depth-banner">
      {t("lithologyView_nLayersHiddenDueToMissingDepths", { count: hiddenCount })}
    </Alert>
  );
};
