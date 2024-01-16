import React, { useState, useEffect, useRef } from "react";
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
  getCompletions,
  addCompletion,
  updateCompletion,
  copyCompletion,
  deleteCompletion,
} from "../../../../api/fetchApiV2";
import CompletionContent from "./completionContent";
import CompletionHeaderInput from "./completionHeaderInput";
import CompletionHeaderDisplay from "./completionHeaderDisplay";
import Prompt from "../../../prompt/prompt";

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
  const [state, setState] = useState({
    index: 0,
    selected: null,
    completions: [],
  });
  const mounted = useRef(false);
  const [editing, setEditing] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const loadData = index => {
    if (boreholeId && mounted.current) {
      getCompletions(boreholeId).then(response => {
        if (response?.length > 0) {
          if (index === null) {
            index = response.findIndex(c => c.isPrimary);
          }
          setState({
            index: index,
            selected: response[index],
            completions: response,
          });
        } else {
          setState({
            index: 0,
            selected: null,
            completions: [],
          });
        }
      });
    } else if (boreholeId === null) {
      setState({
        index: 0,
        selected: null,
        completions: [],
      });
    }
  };

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
  };

  const saveCompletion = completion => {
    setEditing(false);
    if (completion.id === 0) {
      addCompletion(completion).then(() => {
        loadData(state.completions.length - 1);
      });
    } else {
      updateCompletion(completion).then(() => {
        loadData(state.index);
      });
    }
  };

  const copySelectedCompletion = () => {
    copyCompletion(state.selected.id).then(() => {
      loadData(state.completions.length);
    });
  };

  const deleteSelectedCompletion = () => {
    setShowDeletePrompt(true);
  };

  const onDeleteConfirmed = () => {
    var newTabIndex = state.index > 0 ? state.index - 1 : 0;
    deleteCompletion(state.selected.id).then(() => {
      loadData(newTabIndex);
    });
  };

  const cancelChanges = () => {
    setEditing(false);
    if (state.selected.id === 0) {
      var newCompletionList = state.completions.slice(0, -1);
      setState({
        index: newCompletionList.length - 1,
        selected: newCompletionList[newCompletionList.length - 1],
        completions: newCompletionList,
      });
    }
  };

  useEffect(() => {
    mounted.current = true;
    loadData(null);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boreholeId]);

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
                      cancelChanges={cancelChanges}
                      saveCompletion={saveCompletion}
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
      <Prompt
        open={showDeletePrompt}
        setOpen={setShowDeletePrompt}
        titleLabel="deleteCompletionTitle"
        messageLabel="deleteCompletionMessage"
        actions={[
          {
            label: "cancel",
            action: null,
          },
          {
            label: "delete",
            action: onDeleteConfirmed,
          },
        ]}
      />
    </>
  );
};
export default Completion;
