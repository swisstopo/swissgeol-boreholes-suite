import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Stack, Tooltip, Typography } from "@mui/material";
import {
  AddButton,
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
import Prompt from "../../../prompt/prompt";

const Completion = props => {
  const { isEditable } = props;
  const { boreholeId, completionId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();
  const [state, setState] = useState({
    index: 0,
    selected: null,
    completions: [],
  });
  const mounted = useRef(false);
  const [editing, setEditing] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [newlySelectedTab, setNewlySelectedTab] = useState(null);

  const updateHistory = completionId => {
    var newLocation =
      process.env.PUBLIC_URL +
      "/editor/" +
      boreholeId +
      "/completion/" +
      completionId;
    if (completionId !== "new") {
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

  const loadData = (index, selectedId) => {
    if (boreholeId && mounted.current) {
      getCompletions(parseInt(boreholeId, 10)).then(response => {
        if (response?.length > 0) {
          if (selectedId === "new") {
            addNewCompletion(null, response);
          } else {
            if (index === null) {
              if (selectedId != null) {
                index = response.findIndex(
                  c => c.id === parseInt(selectedId, 10),
                );
              } else {
                var primaryCompletion = response.find(c => c.isPrimary);
                updateHistory(primaryCompletion.id);
                index = primaryCompletion.id;
              }
            }
            setState({
              index: index,
              selected: response[index],
              completions: response,
            });
          }
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
    if (editing) {
      setNewlySelectedTab(index);
    } else {
      updateHistory(state.completions[index].id);
      setState({
        index: index,
        selected: state.completions[index],
        completions: state.completions,
      });
    }
  };

  const switchTabs = continueSwitching => {
    if (continueSwitching) {
      setEditing(false);
      updateHistory(state.completions[newlySelectedTab].id);
      setState({
        index: newlySelectedTab,
        selected: state.completions[newlySelectedTab],
        completions: state.completions,
      });
    }
    if (newlySelectedTab !== null) {
      setNewlySelectedTab(null);
    }
  };

  const addNewCompletion = (event, loadedCompletions = null) => {
    var tempCompletion = {
      id: 0,
      boreholeId: boreholeId,
      name: null,
      kindId: null,
      isPrimary: state.completions.length === 0,
      abandonDate: null,
      notes: null,
    };
    if (loadedCompletions === null) {
      loadedCompletions = state.completions;
    }
    setState({
      index: loadedCompletions.length,
      selected: tempCompletion,
      completions: [...loadedCompletions, tempCompletion],
    });
    setEditing(true);
    updateHistory("new");
  };

  const saveCompletion = completion => {
    var index =
      completion.id === 0 ? state.completions.length - 1 : state.index;
    if (newlySelectedTab !== null) {
      index = newlySelectedTab;
      setNewlySelectedTab(null);
    }
    setEditing(false);
    if (completion.id === 0) {
      addCompletion(completion).then(newCompletion => {
        loadData(index);
        updateHistory(newCompletion.id);
      });
    } else {
      updateCompletion(completion).then(() => {
        loadData(index);
      });
    }
  };

  const copySelectedCompletion = () => {
    copyCompletion(state.selected.id).then(copiedId => {
      loadData(null, copiedId);
      updateHistory(copiedId);
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
    } else if (newlySelectedTab !== null) {
      switchTabs(true);
    }
  };

  useEffect(() => {
    mounted.current = true;
    loadData(null, completionId);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boreholeId, completionId]);

  useEffect(() => {
    if (!isEditable) {
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable]);

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
              <AddButton
                sx={{ marginRight: "5px" }}
                data-cy="add-completion-button"
                onClick={addNewCompletion}>
                {t("addCompletion")}
              </AddButton>
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
                <CompletionBox>
                  {editing ? (
                    <CompletionHeaderInput
                      completion={state.selected}
                      editing={editing}
                      cancelChanges={cancelChanges}
                      saveCompletion={saveCompletion}
                      newlySelectedTab={newlySelectedTab}
                      switchTabs={continueSwitching => {
                        switchTabs(continueSwitching);
                      }}
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
                </CompletionBox>

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
