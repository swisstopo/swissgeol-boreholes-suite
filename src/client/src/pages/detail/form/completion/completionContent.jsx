import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Stack } from "@mui/material";
import PropTypes from "prop-types";
import { getBackfills, getCasings, getInstrumentation } from "../../../../api/fetchApiV2.ts";
import { DataCardExternalContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { BoreholeTab, BoreholeTabContent, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.js";
import Backfill from "./backfill.jsx";
import Casing from "./casing.jsx";
import Instrumentation from "./instrumentation.jsx";

const CompletionContentTabBox = props => {
  return <BoreholeTabContent flex="1 0 0">{props.children()}</BoreholeTabContent>;
};
CompletionContentTabBox.propTypes = { children: PropTypes.func.isRequired };
export const MemoizedCompletionContentTabBox = React.memo(CompletionContentTabBox);

const CompletionContent = ({ completion, editingEnabled }) => {
  const { resetCanSwitch, triggerCanSwitch, canSwitch } = useContext(DataCardExternalContext);
  const { navigateTo } = useBoreholesNavigate();
  const { hash } = useLocation();
  const { t } = useTranslation();
  const [casings, setCasings] = useState([]);
  const [instrumentation, setInstrumentation] = useState([]);
  const [backfills, setBackfills] = useState([]);
  const tabs = [
    {
      label: t("casing"),
      hash: "#casing",
      hasContent: casings.length > 0,
    },
    {
      label: t("instrumentation"),
      hash: "#instrumentation",
      hasContent: instrumentation.length > 0,
    },
    {
      label: t("backfill"),
      hash: "#backfill",
      hasContent: backfills.length > 0,
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [newIndex, setNewIndex] = useState(null);
  const [checkContentDirty, setCheckContentDirty] = useState(false);

  const handleCompletionChanged = (event, index) => {
    setNewIndex(index);
    setCheckContentDirty(true);
    triggerCanSwitch();
  };

  const loadData = useCallback(() => {
    Promise.all([getCasings(completion.id), getInstrumentation(completion.id), getBackfills(completion.id)])
      .then(([casings, instrumentation, backfills]) => {
        setCasings(casings);
        setInstrumentation(instrumentation);
        setBackfills(backfills);
      })
      .catch(error => {
        console.error("Error loading data:", error);
      });
  }, [completion.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (checkContentDirty) {
      if (canSwitch === 1 && newIndex !== null) {
        setActiveIndex(newIndex);
        setNewIndex(null);
        if (hash !== tabs[newIndex].hash) {
          navigateTo({ hash: tabs[newIndex].hash });
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
    const newTabIndex = tabs.findIndex(t => t.hash === hash);
    if (newTabIndex > -1 && activeIndex !== newTabIndex) {
      handleCompletionChanged(null, newTabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

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
        <BoreholeTabs value={activeIndex} onChange={handleCompletionChanged}>
          {tabs.map((tab, index) => (
            <BoreholeTab
              data-cy={"completion-content-tab-" + tab.hash.replace("#", "")}
              label={tab.label === null || tab.label === "" ? t("common:np") : tab.label}
              key={index}
              hasContent={tab.hasContent}
            />
          ))}
        </BoreholeTabs>
      </Stack>
      {/* eslint-disable-next-line react/no-children-prop */}
      <MemoizedCompletionContentTabBox children={renderTabContent} />
    </Stack>
  );
};

CompletionContent.propTypes = {
  completion: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  editingEnabled: PropTypes.bool.isRequired,
};

export default CompletionContent;
