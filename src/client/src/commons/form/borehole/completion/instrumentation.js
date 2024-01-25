import React, { useState, useEffect, useMemo, createRef, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddButton,
  CompletionCard,
  CompletionGrid,
  CompletionGridItem,
} from "./styledComponents";
import {
  getInstrumentation,
  addInstrumentation,
  updateInstrumentation,
  deleteInstrumentation,
} from "../../../../api/fetchApiV2";
import InstrumentationInput from "./instrumentationInput";
import InstrumentationDisplay from "./instrumentationDisplay";

const Instrumentation = ({ isEditable, completionId }) => {
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [selectedInstrumentation, setSelectedInstrumentation] = useState(null);
  const [displayedInstrumentations, setDisplayedInstrumentations] = useState(
    [],
  );
  const [state, setState] = useState({
    index: 0,
    instrumentations: [],
    isLoadingData: true,
  });

  const loadData = index => {
    setState({ isLoadingData: true });
    if (completionId && mounted.current) {
      getInstrumentation(completionId).then(response => {
        if (response?.length > 0) {
          setState({
            index: index,
            instrumentations: response,
            isLoadingData: false,
          });
        } else {
          setState({
            index: 0,
            instrumentations: [],
            isLoadingData: false,
          });
        }
      });
    } else if (completionId === null) {
      setState({
        index: 0,
        instrumentations: [],
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
    setDisplayedInstrumentations(state.instrumentations);
  }, [state.instrumentations]);

  // scroll to newly added item
  const instrumentationRefs = useMemo(
    () =>
      Array(displayedInstrumentations?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedInstrumentations],
  );

  useEffect(() => {
    if (displayedInstrumentations?.length > 0) {
      const lastCasingRef =
        instrumentationRefs[displayedInstrumentations?.length - 1];
      if (
        displayedInstrumentations[displayedInstrumentations?.length - 1].id ===
        0
      )
        lastCasingRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedInstrumentations, instrumentationRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          {isEditable && (
            <Tooltip title={t("add")}>
              <AddButton
                data-cy="add-instrumentation-button"
                onClick={e => {
                  e.stopPropagation();
                  if (!selectedInstrumentation) {
                    const tempInstrumentation = { id: 0 };
                    // Check if instrumentations is iterable
                    if (
                      state.instrumentations &&
                      Symbol.iterator in Object(state.instrumentations)
                    ) {
                      setDisplayedInstrumentations([
                        ...state.instrumentations,
                        tempInstrumentation,
                      ]);
                    } else {
                      setDisplayedInstrumentations([tempInstrumentation]);
                    }
                    setSelectedInstrumentation(tempInstrumentation);
                  }
                }}>
                {t("addInstrument")}
              </AddButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <CompletionGrid>
        {displayedInstrumentations?.length > 0 ? (
          displayedInstrumentations
            ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((instrumentation, index) => {
              const isSelected =
                selectedInstrumentation?.id === instrumentation.id;
              const isTempInstrumentation = instrumentation.id === 0;
              return (
                <CompletionGridItem
                  key={instrumentation.id}
                  ref={instrumentationRefs[index]}>
                  {state.instrumentations ? (
                    <CompletionCard key={instrumentation.id}>
                      {isEditable && isSelected ? (
                        <InstrumentationInput
                          instrumentation={instrumentation}
                          setSelectedInstrumentation={
                            setSelectedInstrumentation
                          }
                          completionId={completionId}
                          updateInstrumentation={(instrumentation, data) => {
                            updateInstrumentation(instrumentation, data).then(
                              () => {
                                handleDataChange();
                              },
                            );
                          }}
                          addInstrumentation={data => {
                            addInstrumentation(data).then(() => {
                              handleDataChange();
                            });
                          }}
                        />
                      ) : (
                        !isTempInstrumentation && (
                          <InstrumentationDisplay
                            instrumentation={instrumentation}
                            selectedInstrumentation={selectedInstrumentation}
                            setSelectedInstrumentation={
                              setSelectedInstrumentation
                            }
                            isEditable={isEditable}
                            deleteInstrumentation={instrumentationId => {
                              deleteInstrumentation(instrumentationId).then(
                                () => {
                                  handleDataChange();
                                },
                              );
                            }}
                          />
                        )
                      )}
                    </CompletionCard>
                  ) : (
                    <CircularProgress />
                  )}
                </CompletionGridItem>
              );
            })
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ flexGrow: 1 }}>
            <Typography variant="fullPageMessage">
              {t("msgInstrumentsEmpty")}
            </Typography>
          </Stack>
        )}
      </CompletionGrid>
    </Stack>
  );
};
export default React.memo(Instrumentation);
