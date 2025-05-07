import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { Tab } from "../../../../components/tabs/tabPanel.tsx";
import { WorkflowHistory } from "./workflowHistory.tsx";
import { WorkflowReview } from "./workflowReview.tsx";

export const WorkflowTabs = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("history"),
        hash: "history",
        component: <WorkflowHistory />,
      },
      {
        label: t("review"),
        hash: "review",
        component: <WorkflowReview />,
      },
      {
        label: t("publication"),
        hash: "publication",
        component: <Box />,
      },
    ],
    [t],
  );

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const [tabHash] = window.location.hash.replace("#", "").split("?");
    const newActiveIndex = tabs.findIndex(tab => tab.hash === tabHash);

    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // If tab not found, redirect to first tab, preserving query params
      const newHash = tabs[0].hash;
      const searchParamsString = new URLSearchParams(searchParams).toString();
      const newUrl = `${window.location.pathname}#${newHash}${searchParamsString ? `?${searchParamsString}` : ""}`;
      navigate(newUrl, { replace: true });
    }
  }, [navigate, searchParams, tabs]);

  // Change handler for tab selection
  const handleIndexChange = useCallback(
    (event: SyntheticEvent | null, index: number) => {
      const searchParamsString = new URLSearchParams(searchParams).toString();
      const newHash = tabs[index].hash;
      const newUrl = `${window.location.pathname}#${newHash}${searchParamsString ? `?${searchParamsString}` : ""}`;

      navigate(newUrl);
    },
    [navigate, searchParams, tabs],
  );

  return (
    <Stack sx={{ position: "relative", minHeight: theme.spacing(20), width: "100%" }}>
      <BoreholeTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => (
          <BoreholeTab data-cy={`${tab.hash}-tab`} label={tab.label} key={tab.hash} hasContent={true} />
        ))}
      </BoreholeTabs>
      <BoreholeTabContentBox flex="1 0 0">{tabs[activeIndex].component}</BoreholeTabContentBox>
    </Stack>
  );
};
