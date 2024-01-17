import React, { useState } from "react";
import Backfill from "./backfill";
import Instrumentation from "./instrumentation";
import { Box, Stack, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const CompletionContentTabGroup = styled(Tabs)({
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const CompletionContentTab = styled(props => <Tab disableRipple {...props} />)(
  () => ({
    color: "rgba(0, 0, 0, 0.6)",
    fontFamily: "Lato",
    fontWeight: "bold",
    textTransform: "none",
    fontSize: "16px",
    "&.Mui-selected": {
      color: "rgba(0, 0, 0, 1) !important",
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    "&.Mui-focusVisible": {
      backgroundColor: "rgba(100, 95, 228, 0.32)",
    },
  }),
);

const CompletionContent = ({ completion, isEditable }) => {
  const { t } = useTranslation();
  const tabTitels = [{ name: t("instrument") }, { name: t("filling") }];
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
    <>
      <Stack direction="column">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <CompletionContentTabGroup
            value={state.index}
            onChange={handleCompletionChanged}>
            {tabTitels.map((item, index) => {
              return (
                <CompletionContentTab
                  data-cy={"completion-content-header-tab-" + index}
                  label={
                    item.name === null || item.name === ""
                      ? t("common:np")
                      : item.name
                  }
                  key={index}
                />
              );
            })}
          </CompletionContentTabGroup>
        </Stack>
        <>
          <Box
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              width: "100%",
              borderWidth: "1px",
              borderColor: "black",
              padding: "10px 10px 5px 10px",
              marginBottom: "10px",
            }}>
            {(state.index === 0 && (
              <Instrumentation
                completionId={completion.id}
                isEditable={isEditable}
              />
            )) ||
              (state.index === 1 && (
                <Backfill
                  completionId={completion.id}
                  isEditable={isEditable}
                />
              ))}
          </Box>
        </>
      </Stack>
    </>
  );
};

export default CompletionContent;
