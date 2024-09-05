import { useContext, useEffect, useRef, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../../../../components/styledTabComponents.jsx";
import {
  addCompletion,
  copyCompletion,
  deleteCompletion,
  getCompletions,
  updateCompletion,
} from "../../../../api/fetchApiV2.js";
import CompletionContent from "./completionContent.jsx";
import CompletionHeaderInput from "./completionHeaderInput.jsx";
import CompletionHeaderDisplay from "./completionHeaderDisplay.jsx";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPage } from "../../../../components/styledComponents.ts";
import { DataCardExternalContext } from "../../../../components/dataCard/dataCardContext.jsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import TrashIcon from "../../../../assets/icons/trash.svg?react";

const Completion = props => {
  const { isEditable } = props;
  const { resetCanSwitch, triggerCanSwitch, canSwitch } = useContext(DataCardExternalContext);
  const { showPrompt } = useContext(PromptContext);
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
  const [checkContentDirty, setCheckContentDirty] = useState(false);
  const [completionToBeSaved, setCompletionToBeSaved] = useState(null);

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
    var newLocation = "/" + boreholeId + "/completion/" + selectedId;
    if (selectedId !== "new") {
      if (location.hash !== "" && selectedId.toString() === completionId) {
        newLocation += location.hash;
      } else {
        newLocation += "#casing";
      }
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

  const checkIfContentIsDirty = () => {
    setCheckContentDirty(true);
    triggerCanSwitch();
  };

  const handleCompletionChanged = (event, index) => {
    if (state.editing) {
      setState({ ...state, switchTabTo: index, trySwitchTab: true });
    } else {
      setState({ ...state, switchTabTo: index });
      checkIfContentIsDirty();
    }
  };

  const switchTabs = continueSwitching => {
    if (continueSwitching) {
      checkIfContentIsDirty();
    } else {
      setState({
        ...state,
        switchTabTo: null,
        trySwitchTab: false,
        editing: state.editing,
      });
    }
  };

  useEffect(() => {
    if (checkContentDirty) {
      if (canSwitch !== 0 && completionToBeSaved !== null) {
        saveCompletion(completionToBeSaved, canSwitch === -1);
      }

      if (canSwitch === 1 && state.switchTabTo !== null) {
        if (state.switchTabTo === -1) {
          updateHistory("new");
        } else if (state.selected.id === 0) {
          var newCompletionList = state.displayed.slice(0, -1);
          if (newCompletionList.length === 0) {
            history.push("/" + boreholeId + "/completion");
            resetState();
          } else {
            updateHistory(newCompletionList[state.switchTabTo].id);
          }
        } else {
          updateHistory(state.displayed[state.switchTabTo].id);
        }
      }

      if (completionToBeSaved !== null && canSwitch === -1) {
        var displayed = state.displayed;
        const index = displayed.findIndex(item => item.id === completionToBeSaved.id);
        displayed[index] = completionToBeSaved;

        setState({
          ...state,
          displayed: displayed,
          selected: completionToBeSaved,
          switchTabTo: null,
          trySwitchTab: false,
          editing: false,
        });
      } else {
        setState({
          ...state,
          switchTabTo: null,
          trySwitchTab: false,
          editing: false,
        });
      }

      if (canSwitch !== 0) {
        setCompletionToBeSaved(null);
        resetCanSwitch();
        setCheckContentDirty(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSwitch]);

  const saveCompletion = (completion, preventReload) => {
    if (completion.id === 0) {
      addCompletion(completion).then(() => {
        setState({
          ...state,
          switchTabTo: state.switchTabTo === null ? state.displayed.length - 1 : state.switchTabTo,
        });
        if (!preventReload) {
          loadData();
        }
      });
    } else {
      updateCompletion(completion).then(() => {
        if (!preventReload) {
          loadData();
        }
      });
    }
  };

  const checkSwitchBeforeSave = completion => {
    if (state.trySwitchTab) {
      setCompletionToBeSaved(completion);
      checkIfContentIsDirty();
    } else {
      saveCompletion(completion);
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
        history.push("/" + boreholeId + "/completion");
      } else {
        updateHistory(newCompletionList[index].id);
      }
    }
  };

  const deleteSelectedCompletion = () => {
    showPrompt(t("deleteCompletionMessage"), [
      {
        label: t("cancel"),
        action: null,
      },
      {
        label: t("delete"),
        icon: <TrashIcon />,
        variant: "contained",
        action: onDeleteConfirmed,
      },
    ]);
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

  const firstRender = useRef(true);

  useEffect(() => {
    // Prevents resetting the url to 'completion/{id}#casing' on the first render, when completions are not yet loaded
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (completionId === "new" && (state.switchTabTo === null || state.switchTabTo === -1)) {
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
        switchTabTo: null,
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
      history.push("/" + boreholeId + "/completion");
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <BdmsTabs value={state.index} onChange={handleCompletionChanged}>
              {state.displayed?.length > 0 &&
                state.displayed.map((item, index) => {
                  return (
                    <BdmsTab
                      data-cy={"completion-header-tab-" + index}
                      label={item.name === null || item.name === "" ? t("common:np") : item.name}
                      key={item.id}
                    />
                  );
                })}
            </BdmsTabs>
            {isEditable && (
              <AddButton
                label="addCompletion"
                disabled={state.selected?.id === 0}
                onClick={e => {
                  handleCompletionChanged(e, -1);
                }}
              />
            )}
          </Stack>
          {state.selected != null && (
            <>
              <BdmsTabContentBox sx={{ padding: "18px" }} data-cy="completion-header">
                {state.editing ? (
                  <CompletionHeaderInput
                    completion={state.selected}
                    editing={state.editing}
                    cancelChanges={cancelChanges}
                    saveCompletion={checkSwitchBeforeSave}
                    trySwitchTab={state.trySwitchTab}
                    switchTabs={continueSwitching => {
                      switchTabs(continueSwitching);
                    }}
                  />
                ) : (
                  <CompletionHeaderDisplay
                    completion={state.selected}
                    isEditable={isEditable}
                    setEditing={shouldEdit => setState({ ...state, editing: shouldEdit })}
                    copyCompletion={copySelectedCompletion}
                    deleteCompletion={deleteSelectedCompletion}
                  />
                )}
              </BdmsTabContentBox>
            </>
          )}
        </Stack>
        <Stack flex="1 0 0" marginTop="10px">
          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
              <CircularProgress />
            </Stack>
          ) : state.selected === null ? (
            <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
              <Typography variant="fullPageMessage">{t("msgCompletionEmpty")}</Typography>
            </Stack>
          ) : (
            state.selected?.id > 0 && <CompletionContent completion={state.selected} isEditable={isEditable} />
          )}
        </Stack>
      </FullPage>
    </>
  );
};
export default Completion;
