import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Casing from "./casing";
import Backfill from "./backfill";
import Instrumentation from "./instrumentation";
import { Stack } from "@mui/material";
import { CompletionBox, CompletionTabs, CompletionTab } from "./styledComponents";
import { useTranslation } from "react-i18next";

const CompletionContent = ({ completion, isEditable }) => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();
  const tabs = [
    {
      label: t("casing"),
      hash: "casing",
    },
    { label: t("instrument"), hash: "instrumentation" },
    { label: t("filling"), hash: "backfill" },
  ];
  const [state, setState] = useState({
    index: 0,
    selected: null,
  });

  const handleCompletionChanged = (event, index) => {
    setState({
      index: index,
    });
    var newLocation = location.pathname + "#" + tabs[index].hash;
    if (location.pathname + location.hash !== newLocation) {
      history.push(location.pathname + "#" + tabs[index].hash);
    }
  };

  useEffect(() => {
    var newTabIndex = tabs.findIndex(t => t.hash === location.hash.replace("#", ""));
    if (newTabIndex > -1 && state.index !== newTabIndex) {
      handleCompletionChanged(null, newTabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  return (
    <Stack direction="column" flex="1 0 0">
      <Stack direction="row" justifyContent="space-between" alignItems="center" flex="0 1 auto">
        <CompletionTabs value={state.index} onChange={handleCompletionChanged}>
          {tabs.map((tab, index) => {
            return (
              <CompletionTab
                data-cy={"completion-content-header-tab-" + tab.hash}
                label={tab.label === null || tab.label === "" ? t("common:np") : tab.label}
                key={index}
              />
            );
          })}
        </CompletionTabs>
      </Stack>
      <CompletionBox flex="1 0 0">
        {(state.index === 0 && <Casing completionId={completion.id} isEditable={isEditable} />) ||
          (state.index === 1 && <Instrumentation completionId={completion.id} isEditable={isEditable} />) ||
          (state.index === 2 && <Backfill completionId={completion.id} isEditable={isEditable} />)}
      </CompletionBox>
    </Stack>
  );
};

export default CompletionContent;
