import React, { useState } from "react";
import Casing from "./casing";
import Backfill from "./backfill";
import Instrumentation from "./instrumentation";
import { Stack } from "@mui/material";
import {
  CompletionBox,
  CompletionTabs,
  CompletionTab,
} from "./styledComponents";
import { useTranslation } from "react-i18next";

const CompletionContent = ({ completion, isEditable }) => {
  const { t } = useTranslation();
  const tabTitels = [
    { name: t("casing") },
    { name: t("instrument") },
    { name: t("filling") },
  ];
  const [state, setState] = useState({
    index: 0,
    selected: null,
  });

  const handleCompletionChanged = (event, index) => {
    setState({
      index: index,
    });
  };

  return (
    <Stack direction="column" flex="1 0 0">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flex="0 1 auto">
        <CompletionTabs value={state.index} onChange={handleCompletionChanged}>
          {tabTitels.map((item, index) => {
            return (
              <CompletionTab
                data-cy={"completion-content-header-tab-" + item.name}
                label={
                  item.name === null || item.name === ""
                    ? t("common:np")
                    : item.name
                }
                key={index}
              />
            );
          })}
        </CompletionTabs>
      </Stack>
      <CompletionBox flex="1 0 0">
        {(state.index === 0 && (
          <Casing completionId={completion.id} isEditable={isEditable} />
        )) ||
          (state.index === 1 && (
            <Instrumentation
              completionId={completion.id}
              isEditable={isEditable}
            />
          )) ||
          (state.index === 2 && (
            <Backfill completionId={completion.id} isEditable={isEditable} />
          ))}
      </CompletionBox>
    </Stack>
  );
};

export default CompletionContent;
