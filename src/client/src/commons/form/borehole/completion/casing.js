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
  getCasings,
  addCasing,
  updateCasing,
  deleteCasing,
} from "../../../../api/fetchApiV2";
import CasingInput from "./casingInput";
import CasingDisplay from "./casingDisplay";

const Casing = ({ isEditable, completionId }) => {
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [selectedCasing, setSelectedCasing] = useState(null);
  const [displayedCasings, setDisplayedCasings] = useState([]);
  const [state, setState] = useState({
    index: 0,
    casings: [],
    isLoadingData: true,
  });

  const loadData = index => {
    setState({ isLoadingData: true });
    if (completionId && mounted.current) {
      getCasings(completionId).then(response => {
        if (response?.length > 0) {
          setState({
            index: index,
            casings: response,
            isLoadingData: false,
          });
        } else {
          setState({
            index: 0,
            casings: [],
            isLoadingData: false,
          });
        }
      });
    } else if (completionId === null) {
      setState({
        index: 0,
        casings: [],
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
    setDisplayedCasings(state.casings);
  }, [state.casings]);

  // scroll to newly added item
  const casingRefs = useMemo(
    () =>
      Array(displayedCasings?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedCasings],
  );

  useEffect(() => {
    if (displayedCasings?.length > 0) {
      const lastCasingRef = casingRefs[displayedCasings?.length - 1];
      if (displayedCasings[displayedCasings?.length - 1].id === 0)
        lastCasingRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedCasings, casingRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          {isEditable && (
            <Tooltip title={t("add")}>
              <AddButton
                data-cy="add-casing-button"
                onClick={e => {
                  e.stopPropagation();
                  if (!selectedCasing) {
                    const tempCasing = { id: 0 };
                    setDisplayedCasings([...state.casings, tempCasing]);
                    setSelectedCasing(tempCasing);
                  }
                }}>
                {t("addCasing")}
              </AddButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <CompletionGrid>
        {displayedCasings?.length > 0
          ? displayedCasings
              ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
              .map((casing, index) => {
                const isSelected = selectedCasing?.id === casing.id;
                const isTempCasing = casing.id === 0;
                return (
                  <CompletionGridItem key={casing.id} ref={casingRefs[index]}>
                    {state.casings ? (
                      <CompletionCard key={casing.id}>
                        {isEditable && isSelected ? (
                          <CasingInput
                            casing={casing}
                            setSelectedCasing={setSelectedCasing}
                            completionId={completionId}
                            updateCasing={(casing, data) => {
                              updateCasing(casing, data).then(() => {
                                handleDataChange();
                              });
                            }}
                            addCasing={data => {
                              addCasing(data).then(() => {
                                handleDataChange();
                              });
                            }}
                          />
                        ) : (
                          !isTempCasing && (
                            <CasingDisplay
                              casing={casing}
                              selectedCasing={selectedCasing}
                              setSelectedCasing={setSelectedCasing}
                              isEditable={isEditable}
                              deleteCasing={casingId => {
                                deleteCasing(casingId).then(() => {
                                  handleDataChange();
                                });
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
          : !state.isLoadingData && (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ flexGrow: 1 }}>
                <Typography variant="fullPageMessage">
                  {t("msgCasingEmpty")}
                </Typography>
              </Stack>
            )}
      </CompletionGrid>
    </Stack>
  );
};
export default React.memo(Casing);
