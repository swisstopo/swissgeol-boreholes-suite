import React, { useState, useEffect, useMemo, createRef, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AddButton, CompletionCard } from "./styledComponents";

export const CompletionContentTab = props => {
  const {
    isEditable,
    completionId,
    getData,
    addData,
    updateData,
    deleteData,
    addLabel,
    emptyLabel,
    renderInput,
    renderDisplay,
  } = props;
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [selected, setSelected] = useState(null);
  const [displayed, setDisplayed] = useState([]);
  const [state, setState] = useState({
    index: 0,
    data: [],
    isLoadingData: true,
  });

  const loadData = index => {
    setState({ isLoadingData: true });
    if (completionId && mounted.current) {
      getData(completionId).then(response => {
        if (response?.length > 0) {
          setState({
            index: index,
            data: response,
            isLoadingData: false,
          });
        } else {
          setState({
            index: 0,
            data: [],
            isLoadingData: false,
          });
        }
      });
    } else if (completionId === null) {
      setState({
        index: 0,
        data: [],
        isLoadingData: false,
      });
    }
  };

  const handleDataChange = () => {
    loadData(state.index);
  };

  useEffect(() => {
    mounted.current = true;
    loadData(0);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionId]);

  useEffect(() => {
    setDisplayed(state.data);
  }, [state.data]);

  // scroll to newly added item
  const dataRefs = useMemo(
    () =>
      Array(displayed?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayed],
  );

  useEffect(() => {
    if (displayed?.length > 0) {
      const lastDataRef = dataRefs[displayed?.length - 1];
      if (displayed[displayed?.length - 1].id === 0)
        lastDataRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayed, dataRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 2, marginBottom: 0, flex: "0 1 auto" }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          {isEditable && (
            <Tooltip title={t("add")}>
              <AddButton
                data-cy={addLabel + "-button"}
                onClick={e => {
                  e.stopPropagation();
                  if (!selected) {
                    const temp = { id: 0 };
                    setDisplayed([...state.data, temp]);
                    setSelected(temp);
                  }
                }}>
                {t(addLabel)}
              </AddButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      {state.isLoadingData ? (
        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <CircularProgress color="inherit" />
        </Stack>
      ) : displayed?.length > 0 ? (
        <Grid
          container
          columnSpacing={{ xs: 2 }}
          rowSpacing={{ xs: 2 }}
          sx={{
            width: "100% !important",
            borderWidth: "1px",
            borderColor: "black",
            padding: "0",
            marginBottom: "10px",
            marginTop: "10px !important",
            marginLeft: "0 !important",
            overflow: "auto",
          }}>
          {displayed
            .sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((item, index) => {
              const isSelected = selected?.id === item.id;
              const isTemp = item.id === 0;
              return (
                <Grid
                  item
                  md={12}
                  lg={12}
                  xl={6}
                  sx={{ padding: "0 8px 8px 8px !important" }}
                  key={item.id}
                  ref={dataRefs[index]}>
                  <CompletionCard key={item.id}>
                    {isEditable && isSelected
                      ? renderInput({
                          item: item,
                          setSelected: setSelected,
                          completionId: completionId,
                          updateData: (item, data) => {
                            updateData(item, data).then(() => {
                              handleDataChange();
                            });
                          },
                          addData: data => {
                            addData(data).then(() => {
                              handleDataChange();
                            });
                          },
                        })
                      : !isTemp &&
                        renderDisplay({
                          item: item,
                          selected: selected,
                          setSelected: setSelected,
                          isEditable: isEditable,
                          deleteData: id => {
                            deleteData(id).then(() => {
                              handleDataChange();
                            });
                          },
                        })}
                  </CompletionCard>
                </Grid>
              );
            })}
        </Grid>
      ) : (
        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Typography variant="fullPageMessage">{t(emptyLabel)}</Typography>
        </Stack>
      )}
    </Stack>
  );
};
