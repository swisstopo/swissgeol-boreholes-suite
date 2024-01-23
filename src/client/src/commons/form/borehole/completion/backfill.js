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
import { AddButton, CompletionGrid } from "./styledComponents";
import {
  getBackfills,
  addBackfill,
  updateBackfill,
  deleteBackfill,
} from "../../../../api/fetchApiV2";
import BackfillInput from "./backfillInput";
import BackfillDisplay from "./backfillDisplay";

const Backfill = ({ isEditable, completionId }) => {
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [selectedBackfill, setSelectedBackfill] = useState(null);
  const [displayedBackfills, setDisplayedBackfills] = useState([]);
  const [state, setState] = useState({
    index: 0,
    backfills: [],
    isLoadingData: true,
  });

  const loadData = index => {
    setState({ isLoadingData: true });
    if (completionId && mounted.current) {
      getBackfills(completionId).then(response => {
        if (response?.length > 0) {
          setState({
            index: index,
            backfills: response,
            isLoadingData: false,
          });
        } else {
          setState({
            index: 0,
            backfills: [],
            isLoadingData: false,
          });
        }
      });
    } else if (completionId === null) {
      setState({
        index: 0,
        backfills: [],
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
    setDisplayedBackfills(state.backfills);
  }, [state.backfills]);

  // scroll to newly added item
  const backfillRefs = useMemo(
    () =>
      Array(displayedBackfills?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedBackfills],
  );

  useEffect(() => {
    if (displayedBackfills?.length > 0) {
      const lastBackfillRef = backfillRefs[displayedBackfills?.length - 1];
      if (displayedBackfills[displayedBackfills?.length - 1].id === 0)
        lastBackfillRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedBackfills, backfillRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          {isEditable && (
            <Tooltip title={t("add")}>
              <AddButton
                data-cy="add-backfill-button"
                onClick={e => {
                  e.stopPropagation();
                  if (!selectedBackfill) {
                    const tempBackfill = { id: 0 };
                    // Check if backfills is iterable
                    if (
                      state.backfills &&
                      Symbol.iterator in Object(state.backfills)
                    ) {
                      setDisplayedBackfills([...state.backfills, tempBackfill]);
                    } else {
                      setDisplayedBackfills([tempBackfill]);
                    }
                    setSelectedBackfill(tempBackfill);
                  }
                }}>
                {t("addFilling")}
              </AddButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <CompletionGrid>
        {displayedBackfills?.length > 0
          ? displayedBackfills
              ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
              .map((backfill, index) => {
                const isSelected = selectedBackfill?.id === backfill.id;
                const isTempBackfill = backfill.id === 0;
                return (
                  <Grid
                    item
                    md={12}
                    lg={12}
                    xl={6}
                    key={backfill.id}
                    ref={backfillRefs[index]}>
                    {state.backfills ? (
                      isEditable && isSelected ? (
                        <BackfillInput
                          backfill={backfill}
                          setSelectedBackfill={setSelectedBackfill}
                          completionId={completionId}
                          updateBackfill={(backfill, data) => {
                            updateBackfill(backfill, data).then(() => {
                              handleDataChange();
                            });
                          }}
                          addBackfill={data => {
                            addBackfill(data).then(() => {
                              handleDataChange();
                            });
                          }}
                        />
                      ) : (
                        !isTempBackfill && (
                          <BackfillDisplay
                            backfill={backfill}
                            selectedBackfill={selectedBackfill}
                            setSelectedBackfill={setSelectedBackfill}
                            isEditable={isEditable}
                            deleteBackfill={backfillId => {
                              deleteBackfill(backfillId).then(() => {
                                handleDataChange();
                              });
                            }}
                          />
                        )
                      )
                    ) : (
                      <CircularProgress />
                    )}
                  </Grid>
                );
              })
          : !state.isLoadingData && (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ flexGrow: 1 }}>
                <Typography variant="fullPageMessage">
                  {t("msgBackfillEmpty")}
                </Typography>
              </Stack>
            )}
      </CompletionGrid>
    </Stack>
  );
};
export default React.memo(Backfill);
