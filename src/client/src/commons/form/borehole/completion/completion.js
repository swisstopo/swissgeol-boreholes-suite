import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, Stack, Typography } from "@mui/material";
import {
  CompletionBox,
  CompletionTabs,
  CompletionTab,
} from "./styledComponents";
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
import Prompt from "../../../../components/prompt/prompt";
import { AddButton } from "../../../../components/buttons/buttons";
import { FullPage } from "../../../../components/baseComponents";

const Completion = props => {
  const { isEditable } = props;
  const { boreholeId, completionId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completions, setCompletions] = useState([]);
  const [state, setState] = useState({
    index: 0,
    selected: null,
    switchTabTo: null,
    displayed: [],
    editing: false,
  });
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const resetState = () => {
    setState({
      index: 0,
      selected: null,
      displayed: [],
      editing: false,
      switchTabTo: null,
      trySwitchTab: false,
    });
  };

  const updateHistory = selectedId => {
    var newLocation =
      process.env.PUBLIC_URL +
      "/editor/" +
      boreholeId +
      "/completion/" +
      selectedId;
    if (selectedId !== "new") {
      newLocation += "#casing";
    }
    if (location.pathname + location.hash !== newLocation) {
      var locationSnippets = location.pathname.split("/");
      if (locationSnippets[locationSnippets.length - 1] === "completion") {
        history.replace(newLocation);
      } else {
        history.push(newLocation);
      }
    }
  };

  const loadData = () => {
    setIsLoading(true);
    if (boreholeId && mounted.current) {
      getCompletions(parseInt(boreholeId, 10)).then(response => {
        if (response?.length > 0) {
          setCompletions(response);
        } else {
          setCompletions([]);
        }
        setIsLoading(false);
      });
    }
  };

  const handleCompletionChanged = (event, index) => {
    if (state.editing) {
      setState({ ...state, switchTabTo: index, trySwitchTab: true });
    } else {
      if (index === -1) {
        updateHistory("new");
      } else {
        updateHistory(state.displayed[index].id);
      }
    }
  };

  const switchTabs = continueSwitching => {
    if (continueSwitching) {
      if (state.switchTabTo === -1) {
        updateHistory("new");
      } else if (state.selected.id === 0) {
        var newCompletionList = state.displayed.slice(0, -1);
        if (newCompletionList.length === 0) {
          history.push(
            process.env.PUBLIC_URL + "/editor/" + boreholeId + "/completion",
          );
          resetState();
        } else {
          updateHistory(newCompletionList[state.switchTabTo].id);
        }
      } else {
        updateHistory(state.displayed[state.switchTabTo].id);
      }
    }
    setState({
      ...state,
      switchTabTo: null,
      trySwitchTab: false,
      editing: continueSwitching ? false : state.editing,
    });
  };

  const saveCompletion = completion => {
    if (completion.id === 0) {
      addCompletion(completion).then(() => {
        setState({
          ...state,
          switchTabTo:
            state.switchTabTo === null
              ? state.displayed.length - 1
              : state.switchTabTo,
        });
        loadData();
      });
    } else {
      updateCompletion(completion).then(() => {
        loadData();
      });
    }
  };

  const copySelectedCompletion = () => {
    copyCompletion(state.selected.id).then(() => {
      setState({ ...state, switchTabTo: state.displayed.length });
      loadData();
    });
  };

  const cancelChanges = () => {
    setState({ ...state, editing: false });
    if (state.selected.id === 0) {
      var newCompletionList = state.displayed.slice(0, -1);
      var index = newCompletionList.length - 1;
      if (newCompletionList.length === 0) {
        history.push(
          process.env.PUBLIC_URL + "/editor/" + boreholeId + "/completion",
        );
      } else {
        updateHistory(newCompletionList[index].id);
      }
    }
  };

  const deleteSelectedCompletion = () => {
    setShowDeletePrompt(true);
  };

  const onDeleteConfirmed = () => {
    var newTabIndex = state.index > 0 ? state.index - 1 : 0;
    setState({ ...state, switchTabTo: newTabIndex });
    deleteCompletion(state.selected.id).then(() => {
      loadData();
    });
  };

  useEffect(() => {
    mounted.current = true;
    loadData();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boreholeId]);

  useEffect(() => {
    if (completionId === "new" && state.switchTabTo === null) {
      var tempCompletion = {
        id: 0,
        boreholeId: boreholeId,
        name: null,
        kindId: null,
        isPrimary: state.displayed.length === 0,
        abandonDate: null,
        notes: null,
      };
      var displayed = completions?.length > 0 ? completions : [];
      setState({
        ...state,
        displayed: [...displayed, tempCompletion],
        index: displayed.length,
        selected: tempCompletion,
        editing: true,
      });
    } else if (completions?.length > 0) {
      var index;
      if (state.switchTabTo != null) {
        index = state.switchTabTo;
      } else if (completionId != null) {
        index = completions.findIndex(c => c.id === parseInt(completionId, 10));
      } else {
        index = completions.findIndex(c => c.isPrimary);
      }
      setState({
        ...state,
        selected: completions[index],
        displayed: completions,
        index: index,
        editing: false,
        switchTabTo: null,
        trySwitchTab: false,
      });
      if (index === -1) {
        updateHistory("new");
      } else {
        updateHistory(completions[index].id);
      }
    } else {
      resetState();
      history.push(
        process.env.PUBLIC_URL + "/editor/" + boreholeId + "/completion",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completions, completionId]);

  useEffect(() => {
    if (!isEditable) {
      setState({ ...state, editing: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable]);

  return (
    <>
      <FullPage>
        <Stack flex="0 1 auto">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center">
            <CompletionTabs
              value={state.index}
              onChange={handleCompletionChanged}>
              {state.displayed?.length > 0 &&
                state.displayed.map((item, index) => {
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
              <AddButton
                label="addCompletion"
                sx={{ marginRight: "5px" }}
                onClick={e => {
                  handleCompletionChanged(e, -1);
                }}
              />
            )}
          </Stack>
          {state.selected != null && (
            <>
              <CompletionBox sx={{ padding: "18px" }}>
                {state.editing ? (
                  <CompletionHeaderInput
                    completion={state.selected}
                    editing={state.editing}
                    cancelChanges={cancelChanges}
                    saveCompletion={saveCompletion}
                    trySwitchTab={state.trySwitchTab}
                    switchTabs={continueSwitching => {
                      switchTabs(continueSwitching);
                    }}
                  />
                ) : (
                  <CompletionHeaderDisplay
                    completion={state.selected}
                    isEditable={isEditable}
                    setEditing={shouldEdit =>
                      setState({ ...state, editing: shouldEdit })
                    }
                    copyCompletion={copySelectedCompletion}
                    deleteCompletion={deleteSelectedCompletion}
                  />
                )}
              </CompletionBox>
            </>
          )}
        </Stack>
        <Stack flex="1 0 0" marginTop="10px">
          {isLoading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ flexGrow: 1 }}>
              <CircularProgress />
            </Stack>
          ) : state.selected === null ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ flexGrow: 1 }}>
              <Typography variant="fullPageMessage">
                {t("msgCompletionEmpty")}
              </Typography>
            </Stack>
          ) : (
            state.selected?.id > 0 && (
              <CompletionContent
                completion={state.selected}
                isEditable={isEditable}
              />
            )
          )}
        </Stack>
      </FullPage>
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
