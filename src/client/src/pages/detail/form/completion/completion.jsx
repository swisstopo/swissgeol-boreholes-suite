import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import { useReloadBoreholes } from "../../../../api/borehole.ts";
import {
  addCompletion,
  copyCompletion,
  deleteCompletion,
  getCompletions,
  updateCompletion,
} from "../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardExternalContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { FullPage } from "../../../../components/styledComponents.ts";
import { BoreholeTab, BoreholeTabContentBox, BoreholeTabs } from "../../../../components/styledTabComponents.tsx";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.js";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import CompletionContent from "./completionContent.jsx";
import CompletionHeaderDisplay from "./completionHeaderDisplay.jsx";
import CompletionHeaderInput from "./completionHeaderInput.jsx";

const Completion = () => {
  const { resetCanSwitch, triggerCanSwitch, canSwitch } = useContext(DataCardExternalContext);
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled } = useContext(EditStateContext);
  const { id: boreholeId } = useRequiredParams();
  const { completionId } = useParams();
  const { navigateTo } = useBoreholesNavigate();
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
  const reloadBoreholes = useReloadBoreholes();

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
    let newLocation = "/" + boreholeId + "/completion/" + selectedId;
    let hash;
    console.log(
      "updateHistory",
      newLocation,
      selectedId,
      completionId,
      location.hash,
      location.hash !== "",
      selectedId.toString() === completionId,
    );
    if (selectedId !== "new") {
      if (location.hash !== "" && selectedId.toString() === completionId) {
        hash = location.hash;
      } else {
        hash = "#casing";
      }
    }

    const locationSnippets = location.pathname.split("/");
    const last = locationSnippets[locationSnippets.length - 1];
    const secondLast = locationSnippets[locationSnippets.length - 2];
    const isCompletion = last === "completion";
    const isCompletionId =
      secondLast === "completion" && /^\d+$/.test(last) && location.hash === "";
    navigateTo({
      path: newLocation,
      hash: hash,
      replace: isCompletion || isCompletionId,
    });
  };

  const loadData = () => {
    setIsLoading(true);
    if (boreholeId && mounted.current) {
      getCompletions(parseInt(boreholeId, 10)).then(response => {
        if (response?.length > 0) {
          // Display primary completion first then order by created date
          response.sort((a, b) => {
            if (a.isPrimary === b.isPrimary) {
              return a.created.localeCompare(b.created);
            }
            return a.isPrimary ? -1 : 1;
          });
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
          const newCompletionList = state.displayed.slice(0, -1);
          if (newCompletionList.length === 0) {
            navigateTo({ path: "/" + boreholeId + "/completion" });
            resetState();
          } else {
            updateHistory(newCompletionList[state.switchTabTo].id);
          }
        } else {
          updateHistory(state.displayed[state.switchTabTo].id);
        }
      }

      if (completionToBeSaved !== null && canSwitch === -1) {
        const displayed = state.displayed;
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
        reloadBoreholes();
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
      const newCompletionList = state.displayed.slice(0, -1);
      const index = newCompletionList.length - 1;
      if (newCompletionList.length === 0) {
        navigateTo({ path: "/" + boreholeId + "/completion" });
      } else {
        updateHistory(newCompletionList[index].id);
      }
    }
  };

  const deleteSelectedCompletion = () => {
    showPrompt(t("deleteCompletionMessage"), [
      {
        label: "cancel",
        action: null,
      },
      {
        label: "delete",
        icon: <Trash2 />,
        variant: "contained",
        action: onDeleteConfirmed,
      },
    ]);
  };

  const onDeleteConfirmed = () => {
    const newTabIndex = state.index > 0 ? state.index - 1 : 0;
    setState({ ...state, switchTabTo: newTabIndex });
    deleteCompletion(state.selected.id).then(() => {
      loadData();
      reloadBoreholes();
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
      const tempCompletion = {
        id: 0,
        boreholeId: boreholeId,
        name: null,
        kindId: null,
        isPrimary: state.displayed.length === 0,
        abandonDate: null,
        notes: null,
      };
      const displayed = completions?.length > 0 ? completions : [];
      setState({
        ...state,
        displayed: [...displayed, tempCompletion],
        index: displayed.length,
        selected: tempCompletion,
        switchTabTo: null,
        editing: true,
      });
    } else if (completions?.length > 0) {
      let index;
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
      navigateTo({ path: "/" + boreholeId + "/completion" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completions, completionId]);

  useEffect(() => {
    if (!editingEnabled) {
      setState({ ...state, editing: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEnabled]);

  return (
    <>
      <FullPage>
        <Stack flex="0 1 auto">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginRight: "5px" }}>
            <BoreholeTabs value={state.index} onChange={handleCompletionChanged}>
              {state.displayed?.length > 0 &&
                state.displayed.map((item, index) => {
                  return (
                    <BoreholeTab
                      data-cy={"completion-header-tab-" + index}
                      label={item.name === null || item.name === "" ? t("common:np") : item.name}
                      key={item.id}
                    />
                  );
                })}
            </BoreholeTabs>
            {editingEnabled && (
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
              <BoreholeTabContentBox sx={{ padding: "18px" }} data-cy="completion-header">
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
                    setEditing={shouldEdit => setState({ ...state, editing: shouldEdit })}
                    copyCompletion={copySelectedCompletion}
                    deleteCompletion={deleteSelectedCompletion}
                  />
                )}
              </BoreholeTabContentBox>
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
            state.selected?.id > 0 && <CompletionContent completion={state.selected} editingEnabled={editingEnabled} />
          )}
        </Stack>
      </FullPage>
    </>
  );
};
export default Completion;
