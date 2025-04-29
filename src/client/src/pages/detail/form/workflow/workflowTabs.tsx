import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { Tab } from "../../../../components/tabs/tabPanel.tsx";

export const WorkflowTabs = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("history"),
        hash: "history",
        component: <Box />,
      },
      {
        label: t("review"),
        hash: "review",
        component: <Box />,
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
    const searchString = location.search?.slice(1);
    const hashWithoutHash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
    const [tabHash, serachParams] = hashWithoutHash.split("?");
    const newActiveIndex = tabs.findIndex(tab => tab.hash === tabHash);

    const queryString = searchString ?? serachParams;
    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // If tab not found, redirect to first tab, preserving query
      const newHash = `${tabs[0].hash}${queryString ? `?${queryString}` : ""}`;
      history.replace({ pathname: location.pathname, hash: newHash });
    }
  }, [location, history, tabs]);

  // Change handler for tab selection
  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    const hashWithoutHash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
    const [, queryString] = hashWithoutHash.split("?");

    const newHash = `${tabs[index].hash}${queryString ? `?${queryString}` : ""}`;

    if (location.hash !== `#${newHash}`) {
      history.push({ pathname: location.pathname, hash: newHash });
    }
  };

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
