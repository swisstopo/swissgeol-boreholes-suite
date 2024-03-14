import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Casing from "./casing";
import Backfill from "./backfill";
import Instrumentation from "./instrumentation";
import { Stack } from "@mui/material";
import { CompletionBox, CompletionTabs, CompletionTab } from "./styledComponents";
import { useTranslation } from "react-i18next";
import { DataCardExternalContext } from "../../../../components/dataCard/dataCardContext";

const CompletionContentTabBox = props => {
  return <CompletionBox flex="1 0 0">{props.children()}</CompletionBox>;
};
export const MemoizedCompletionContentTabBox = React.memo(CompletionContentTabBox);

const CompletionContent = ({ completion, isEditable }) => {
  const { resetCanSwitch, triggerCanSwitch, canSwitch } = useContext(DataCardExternalContext);
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [newIndex, setNewIndex] = useState(null);
  const [checkContentDirty, setCheckContentDirty] = useState(false);

  const handleCompletionChanged = (event, index) => {
    setNewIndex(index);
    setCheckContentDirty(true);
    triggerCanSwitch();
  };

  useEffect(() => {
    if (checkContentDirty) {
      if (canSwitch === 1 && newIndex !== null) {
        setActiveIndex(newIndex);
        setNewIndex(null);
        var newLocation = location.pathname + "#" + tabs[newIndex].hash;
        if (location.pathname + location.hash !== newLocation) {
          history.push(newLocation);
        }
      } else if (canSwitch === -1) {
        setNewIndex(null);
      }
      if (canSwitch !== 0) {
        resetCanSwitch();
        setCheckContentDirty(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSwitch]);

  useEffect(() => {
    var newTabIndex = tabs.findIndex(t => t.hash === location.hash.replace("#", ""));
    if (newTabIndex > -1 && activeIndex !== newTabIndex) {
      handleCompletionChanged(null, newTabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const renderTabContent = useCallback(() => {
    return (
      (activeIndex === 0 && <Casing completionId={completion.id} isEditable={isEditable} />) ||
      (activeIndex === 1 && <Instrumentation completionId={completion.id} isEditable={isEditable} />) ||
      (activeIndex === 2 && <Backfill completionId={completion.id} isEditable={isEditable} />)
    );
  }, [activeIndex, completion.id, isEditable]);

  return (
    <Stack direction="column" flex="1 0 0">
      <Stack direction="row" justifyContent="space-between" alignItems="center" flex="0 1 auto">
        <CompletionTabs value={activeIndex} onChange={handleCompletionChanged}>
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
      {
        // eslint-disable-next-line react/no-children-prop
        <MemoizedCompletionContentTabBox children={renderTabContent} />
      }
    </Stack>
  );
};

export default CompletionContent;
