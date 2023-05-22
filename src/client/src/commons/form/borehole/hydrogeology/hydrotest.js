import React, { useState, useEffect, useMemo, createRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import {
  useHydrotestMutations,
  useHydrotests,
} from "../../../../api/fetchApiV2";
import HydrotestInput from "./hydrotestInput";
import HydrotestDisplay from "./hydrotestDisplay";

const Hydrotest = ({ isEditable, boreholeId }) => {
  const { data: hydrotests, isSuccess } = useHydrotests(boreholeId);
  const { t } = useTranslation();
  const {
    add: { mutate: addHydrotest },
    update: { mutate: updateHydrotest },
    delete: { mutate: deleteHydrotest },
  } = useHydrotestMutations();
  const [selectedHydrotest, setSelectedHydrotest] = useState(null);
  const [displayedHydrotests, setDisplayedHydrotests] = useState([]);
  const [addedHydrotestFromResultTable, setAddedHydrotestFromResultTable] =
    useState(false);

  useEffect(() => {
    setDisplayedHydrotests(hydrotests);
  }, [hydrotests]);

  // scroll to newly added item
  const hydrotestRefs = useMemo(
    () =>
      Array(displayedHydrotests?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedHydrotests],
  );

  // keep form open if hydrotest was saved when adding a test result.
  useEffect(() => {
    if (addedHydrotestFromResultTable) {
      const sortedtests = hydrotests?.sort(
        (a, b) => new Date(b.updated) - new Date(a.updated),
      );
      setSelectedHydrotest(sortedtests[0]);
      setAddedHydrotestFromResultTable(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrotests]);

  useEffect(() => {
    if (displayedHydrotests?.length > 0) {
      const lastHydrotestRef = hydrotestRefs[displayedHydrotests?.length - 1];
      if (displayedHydrotests[displayedHydrotests?.length - 1].id === 0)
        lastHydrotestRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedHydrotests, hydrotestRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          sx={{ visibility: isEditable ? "visible" : "hidden" }}>
          <Typography sx={{ mr: 1 }}>{t("hydrotest")}</Typography>
          <Tooltip title={t("add")}>
            <AddCircleIcon
              data-cy="add-hydrotest-button"
              color={selectedHydrotest === null ? "black" : "disabled"}
              onClick={e => {
                e.stopPropagation();
                if (!selectedHydrotest) {
                  const tempHydrotest = { id: 0 };
                  setDisplayedHydrotests([...hydrotests, tempHydrotest]);
                  setSelectedHydrotest(tempHydrotest);
                }
              }}
            />
          </Tooltip>
        </Stack>
      </Box>
      {displayedHydrotests?.length === 0 && (
        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Typography variant="fullPageMessage">
            {t("msgHydrotestEmpty")}
          </Typography>
        </Stack>
      )}
      <Grid
        container
        alignItems="stretch"
        columnSpacing={{ xs: 2 }}
        rowSpacing={{ xs: 2 }}
        sx={{ overflow: "auto", maxHeight: "85vh" }}>
        {displayedHydrotests?.length > 0 &&
          displayedHydrotests
            ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((hydrotest, index) => {
              const isSelected = selectedHydrotest?.id === hydrotest.id;
              const isTempHydrotest = hydrotest.id === 0;
              return (
                <Grid
                  item
                  md={12}
                  lg={12}
                  xl={6}
                  key={hydrotest.id}
                  ref={hydrotestRefs[index]}>
                  {isSuccess ? (
                    isEditable && isSelected ? (
                      <HydrotestInput
                        hydrotest={hydrotest}
                        setSelectedHydrotest={setSelectedHydrotest}
                        updateHydrotest={updateHydrotest}
                        addHydrotest={addHydrotest}
                        boreholeId={boreholeId}
                        setAddedHydrotestFromResultTable={
                          setAddedHydrotestFromResultTable
                        }
                      />
                    ) : (
                      !isTempHydrotest && (
                        <HydrotestDisplay
                          hydrotest={hydrotest}
                          selectedHydrotest={selectedHydrotest}
                          setSelectedHydrotest={setSelectedHydrotest}
                          isEditable={isEditable}
                          deleteHydrotest={deleteHydrotest}
                        />
                      )
                    )
                  ) : (
                    <CircularProgress />
                  )}
                </Grid>
              );
            })}
      </Grid>
    </Stack>
  );
};
export default React.memo(Hydrotest);
