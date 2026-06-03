import React, { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Stack } from "@mui/material";
import "../../../../api/apiInterfaces.ts";
import { getBackfills, getCasings, getInstrumentation } from "../../../../api/fetchApiV2.ts";
import { Backfill, Casing, Instrumentation } from "../../../../api/generated";
import { DataCardExternalContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { BoreholeTab, BoreholeTabContent, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.tsx";
import { BackfillTab } from "./backfillTab.tsx";
import { CasingTab } from "./casingTab.tsx";
import { CompletionContentProps } from "./completionInterfaces.ts";
import { InstrumentationTab } from "./instrumentationTab.tsx";

interface CompletionContentTabBoxProps {
  children: () => ReactNode;
}

const CompletionContentTabBox = ({ children }: CompletionContentTabBoxProps) => {
  return <BoreholeTabContent flex="1 0 0">{children()}</BoreholeTabContent>;
};
const MemoizedCompletionContentTabBox = React.memo(CompletionContentTabBox);

const CompletionContent = ({ completion, editingEnabled }: CompletionContentProps) => {
  const { resetCanSwitch, triggerCanSwitch, canSwitch } = useContext(DataCardExternalContext);
  const { navigateTo } = useBoreholesNavigate();
  const { hash } = useLocation();
  const { t } = useTranslation();
  const [casings, setCasings] = useState<Casing[]>([]);
  const [instrumentation, setInstrumentation] = useState<Instrumentation[]>([]);
  const [backfills, setBackfills] = useState<Backfill[]>([]);
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
  const [newIndex, setNewIndex] = useState<number | null>(null);
  const [checkContentDirty, setCheckContentDirty] = useState(false);

  const handleCompletionChanged = (_event: React.SyntheticEvent | null, index: number) => {
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
  }, [canSwitch, checkContentDirty]);

  useEffect(() => {
    const newTabIndex = tabs.findIndex(t => t.hash === hash);
    if (newTabIndex > -1 && activeIndex !== newTabIndex) {
      handleCompletionChanged(null, newTabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  const renderTabContent = useCallback(() => {
    return (
      (activeIndex === 0 && <CasingTab completionId={completion.id} editingEnabled={editingEnabled} />) ||
      (activeIndex === 1 && <InstrumentationTab completionId={completion.id} editingEnabled={editingEnabled} />) ||
      (activeIndex === 2 && <BackfillTab completionId={completion.id} editingEnabled={editingEnabled} />)
    );
  }, [activeIndex, completion.id, editingEnabled]);

  return (
    <Stack direction="column" flex="1 0 0">
      <Stack direction="row" justifyContent="space-between" alignItems="center" flex="0 1 auto">
        <BoreholeTabs value={activeIndex} onChange={handleCompletionChanged}>
          {tabs.map(tab => (
            <BoreholeTab
              data-cy={"completion-content-tab-" + tab.hash.replace("#", "")}
              label={tab.label === null || tab.label === "" ? t("common:np") : tab.label}
              key={tab.hash}
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

export default CompletionContent;
