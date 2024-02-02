import React, { useState, useEffect, useMemo, createRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography } from "@mui/material";
import { AddButton } from "../../../../components/buttons/buttons";
import {
  DataCard,
  DataCardItem,
  DataCardContainer,
  DataCardButtonContainer,
} from "../../../../components/dataCard/dataCard";
import {
  FullPage,
  FullPageCentered,
} from "../../../../components/baseComponents";

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
    <FullPage>
      <DataCardButtonContainer>
        {isEditable && (
          <AddButton
            data-cy={"add-hydrotest-button"}
            onClick={e => {
              e.stopPropagation();
              if (!selectedHydrotest) {
                const tempHydrotest = { id: 0 };
                setDisplayedHydrotests([...hydrotests, tempHydrotest]);
                setSelectedHydrotest(tempHydrotest);
              }
            }}>
            {t("addHydrotest")}
          </AddButton>
        )}
      </DataCardButtonContainer>
      {displayedHydrotests?.length > 0 ? (
        <DataCardContainer>
          {displayedHydrotests
            .sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((hydrotest, index) => {
              const isSelected = selectedHydrotest?.id === hydrotest.id;
              const isTempHydrotest = hydrotest.id === 0;
              return (
                <DataCardItem key={hydrotest.id} ref={hydrotestRefs[index]}>
                  {isSuccess ? (
                    <DataCard key={hydrotest.id}>
                      {isEditable && isSelected ? (
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
                      )}
                    </DataCard>
                  ) : (
                    <FullPageCentered>
                      <CircularProgress color="inherit" />
                    </FullPageCentered>
                  )}
                </DataCardItem>
              );
            })}
        </DataCardContainer>
      ) : (
        <FullPageCentered>
          <Typography variant="fullPageMessage">
            {t("msgHydrotestEmpty")}
          </Typography>
        </FullPageCentered>
      )}
    </FullPage>
  );
};
export default React.memo(Hydrotest);
