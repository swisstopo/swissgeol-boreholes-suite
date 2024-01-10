import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Stack,
  Tabs,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import {
  useCompletions,
  useCompletionMutations,
} from "../../../../api/fetchApiV2";
import CompletionContent from "./completionContent";
import CompletionHeaderInput from "./completionHeaderInput";
import CompletionHeaderDisplay from "./completionHeaderDisplay";

const CompletionTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const CompletionTab = styled(props => <Tab disableRipple {...props} />)(() => ({
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
}));

const Completion = props => {
  const { isEditable, boreholeId } = props;
  const { t } = useTranslation();
  const {
    add: { mutate: addCompletion },
    update: { mutate: updateCompletion },
    copy: { mutate: copyCompletion },
    delete: { mutate: deleteCompletion },
  } = useCompletionMutations();
  const { data, isSuccess } = useCompletions(boreholeId);
  const [state, setState] = useState({
    index: 0,
    selected: null,
    completions: [],
  });
  const [editing, setEditing] = useState(false);

  const handleCompletionChanged = (event, index) => {
    setState({
      index: index,
      selected: state.completions[index],
      completions: state.completions,
    });
  };

  const addNewCompletion = () => {
    var tempCompletion = {
      id: 0,
      boreholeId: boreholeId,
      name: null,
      kindId: null,
      isPrimary: state.completions.length === 0,
      abandonDate: null,
      notes: null,
    };
    setState({
      index: state.completions.length,
      selected: tempCompletion,
      completions: [...state.completions, tempCompletion],
    });
    setEditing(true);
    // TODO: Select tab with new completion
  };

  const copySelectedCompletion = () => {
    copyCompletion(state.selected.id);
    // TODO: Select tab with copied completion
  };

  const deleteSelectedCompletion = () => {
    // TODO: Show dialog
    deleteCompletion(state.selected.id);
    // TODO: Select tab next to deleted completion
  };

  useEffect(() => {
    if (isSuccess && data && data.length > 0) {
      setState({ index: 0, selected: data[0], completions: data });
    }
  }, [isSuccess, data]);

  return (
    <>
      <Stack direction="column">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <CompletionTabs
            value={state.index}
            onChange={handleCompletionChanged}>
            {state.completions?.length > 0 &&
              state.completions.map((item, index) => {
                return (
                  <CompletionTab
                    data-cy={"completion-header-tab-" + index}
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
          {isEditable && (
            <Tooltip title={t("add")}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewCompletion}
                sx={{
                  fontFamily: "Lato",
                  textTransform: "none",
                  color: "rgba(0, 0, 0, 0.8)",
                  borderColor: "rgba(0, 0, 0, 0.8)",
                }}>
                {t("addCompletion")}
              </Button>
            </Tooltip>
          )}
        </Stack>
        {state.completions?.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ flexGrow: 1 }}>
            <Typography variant="fullPageMessage">
              {t("msgCompletionEmpty")}
            </Typography>
          </Stack>
        ) : (
          <>
            {state.selected != null && (
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
                  {editing ? (
                    <CompletionHeaderInput
                      completion={state.selected}
                      setEditing={setEditing}
                      addCompletion={addCompletion}
                      updateCompletion={updateCompletion}
                    />
                  ) : (
                    <CompletionHeaderDisplay
                      completion={state.selected}
                      isEditable={isEditable}
                      setEditing={setEditing}
                      copyCompletion={copySelectedCompletion}
                      deleteCompletion={deleteSelectedCompletion}
                    />
                  )}
                </Box>

                {state.selected.id > 0 && (
                  <CompletionContent
                    completion={state.selected}
                    isEditable={isEditable}
                  />
                )}
              </>
            )}
          </>
        )}
      </Stack>
    </>
  );
};
export default Completion;
