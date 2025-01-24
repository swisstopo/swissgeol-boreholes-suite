import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { Stack } from "@mui/material";
import { DataCardExternalContext } from "../../../../components/dataCard/dataCardContext.jsx";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../../../../components/styledTabComponents.jsx";
import Backfill from "./backfill.jsx";
import Casing from "./casing.jsx";
import Instrumentation from "./instrumentation.jsx";

const CompletionContentTabBox = props => {
  return <BdmsTabContentBox flex="1 0 0">{props.children()}</BdmsTabContentBox>;
};
export const MemoizedCompletionContentTabBox = React.memo(CompletionContentTabBox);

const CompletionContent = ({ completion, editingEnabled }) => {
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
    { label: t("backfill"), hash: "backfill" },
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
      (activeIndex === 0 && <Casing completionId={completion.id} editingEnabled={editingEnabled} />) ||
      (activeIndex === 1 && <Instrumentation completionId={completion.id} editingEnabled={editingEnabled} />) ||
      (activeIndex === 2 && <Backfill completionId={completion.id} editingEnabled={editingEnabled} />)
    );
  }, [activeIndex, completion.id, editingEnabled]);

  return (
    <Stack direction="column" flex="1 0 0">
      <Stack direction="row" justifyContent="space-between" alignItems="center" flex="0 1 auto">
        <BdmsTabs value={activeIndex} onChange={handleCompletionChanged}>
          {tabs.map((tab, index) => {
            return (
              <BdmsTab
                data-cy={"completion-content-tab-" + tab.hash}
                label={tab.label === null || tab.label === "" ? t("common:np") : tab.label}
                key={index}
              />
            );
          })}
        </BdmsTabs>
      </Stack>
      {
        // eslint-disable-next-line react/no-children-prop
        <MemoizedCompletionContentTabBox children={renderTabContent} />
      }
    </Stack>
  );
};

export default CompletionContent;
