import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Stack } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { Tab } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { CheckboxTable } from "./checkboxTable.tsx";
import { useWorkflow } from "./workflow.ts";
import { WorkflowHistory } from "./workflowHistory.tsx";

export const WorkflowTabs = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));
  const { pathname, hash } = useLocation();

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("history"),
        hash: "#history",
        component: <WorkflowHistory />,
      },
      {
        label: t("review"),
        hash: "#review",
        component: <CheckboxTable tabStatus={workflow?.reviewedTabs} checkAllTitle={"Reviewed"} />,
      },
      {
        label: t("publication"),
        hash: "#publication",
        component: <CheckboxTable tabStatus={workflow?.publishedTabs} checkAllTitle={"Published"} />,
      },
    ],
    [t, workflow?.publishedTabs, workflow?.reviewedTabs],
  );

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const newActiveIndex = tabs.findIndex(tab => tab.hash === hash);

    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // If tab not found, redirect to first tab, preserving query params
      navigate({
        pathname: pathname,
        search: new URLSearchParams(searchParams).toString(),
        hash: tabs[0].hash,
      });
    }
  }, [navigate, tabs, hash, pathname, searchParams]);

  // Change handler for tab selection
  const handleIndexChange = useCallback(
    (event: SyntheticEvent | null, index: number) => {
      const newHash = tabs[index].hash;
      navigate({
        pathname: pathname,
        search: new URLSearchParams(searchParams).toString(),
        hash: newHash,
      });
    },
    [tabs, navigate, pathname, searchParams],
  );

  return (
    <Stack sx={{ position: "relative", minHeight: theme.spacing(20), width: "100%" }}>
      <BoreholeTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => (
          <BoreholeTab
            data-cy={`${tab.hash.replace("#", "")}-tab`}
            label={tab.label}
            key={tab.hash}
            hasContent={true}
          />
        ))}
      </BoreholeTabs>
      <BoreholeTabContentBox flex="1 0 0">{tabs[activeIndex].component}</BoreholeTabContentBox>
    </Stack>
  );
};
