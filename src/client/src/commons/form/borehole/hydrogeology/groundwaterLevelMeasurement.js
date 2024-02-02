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
  useGroundwaterLevelMeasurementMutations,
  useGroundwaterLevelMeasurements,
} from "../../../../api/fetchApiV2";
import GroundwaterLevelMeasurementInput from "./groundwaterLevelMeasurementInput";
import GroundwaterLevelMeasurementDisplay from "./groundwaterLevelMeasurementDisplay";

const GroundwaterLevelMeasurement = props => {
  const { isEditable, boreholeId } = props;
  const { data: groundwaterLevelMeasurements, isSuccess } =
    useGroundwaterLevelMeasurements(boreholeId);
  const { t } = useTranslation();
  const {
    add: { mutate: addGroundwaterLevelMeasurement },
    update: { mutate: updateGroundwaterLevelMeasurement },
    delete: { mutate: deleteGroundwaterLevelMeasurement },
  } = useGroundwaterLevelMeasurementMutations();
  const [
    selectedGroundwaterLevelMeasurement,
    setSelectedGroundwaterLevelMeasurement,
  ] = useState(null);
  const [
    displayedGroundwaterLevelMeasurements,
    setDisplayedGroundwaterLevelMeasurements,
  ] = useState([]);

  useEffect(() => {
    setDisplayedGroundwaterLevelMeasurements(groundwaterLevelMeasurements);
  }, [groundwaterLevelMeasurements]);

  // scroll to newly added item
  const groundwaterLevelMeasurementRefs = useMemo(
    () =>
      Array(displayedGroundwaterLevelMeasurements?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedGroundwaterLevelMeasurements],
  );

  useEffect(() => {
    if (displayedGroundwaterLevelMeasurements?.length > 0) {
      const lastGroundwaterLevelMeasurementRef =
        groundwaterLevelMeasurementRefs[
          displayedGroundwaterLevelMeasurements?.length - 1
        ];
      if (
        displayedGroundwaterLevelMeasurements[
          displayedGroundwaterLevelMeasurements?.length - 1
        ].id === 0
      )
        lastGroundwaterLevelMeasurementRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedGroundwaterLevelMeasurements, groundwaterLevelMeasurementRefs]);

  return (
    <FullPage>
      <DataCardButtonContainer>
        {isEditable && (
          <AddButton
            data-cy={"add-groundwaterlevelmeasurement-button"}
            onClick={e => {
              e.stopPropagation();
              if (selectedGroundwaterLevelMeasurement === null) {
                const tempGroundwaterLevelMeasurement = { id: 0 };
                setDisplayedGroundwaterLevelMeasurements([
                  ...groundwaterLevelMeasurements,
                  tempGroundwaterLevelMeasurement,
                ]);
                setSelectedGroundwaterLevelMeasurement(
                  tempGroundwaterLevelMeasurement,
                );
              }
            }}>
            {t("addGroundwaterLevelMeasurement")}
          </AddButton>
        )}
      </DataCardButtonContainer>
      {displayedGroundwaterLevelMeasurements?.length > 0 ? (
        <DataCardContainer>
          {displayedGroundwaterLevelMeasurements
            .sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((gwlm, index) => {
              const isSelected =
                selectedGroundwaterLevelMeasurement?.id === gwlm.id;
              const isTempGwlm = gwlm.id === 0;
              return (
                <DataCardItem
                  key={gwlm.id}
                  ref={groundwaterLevelMeasurementRefs[index]}>
                  {isSuccess ? (
                    <DataCard key={gwlm.id}>
                      {isEditable && isSelected ? (
                        <GroundwaterLevelMeasurementInput
                          groundwaterLevelMeasurement={gwlm}
                          setSelectedGroundwaterLevelMeasurement={
                            setSelectedGroundwaterLevelMeasurement
                          }
                          updateGroundwaterLevelMeasurement={
                            updateGroundwaterLevelMeasurement
                          }
                          addGroundwaterLevelMeasurement={
                            addGroundwaterLevelMeasurement
                          }
                          boreholeId={boreholeId}
                        />
                      ) : (
                        !isTempGwlm && (
                          <GroundwaterLevelMeasurementDisplay
                            groundwaterLevelMeasurement={gwlm}
                            selectedGroundwaterLevelMeasurement={
                              selectedGroundwaterLevelMeasurement
                            }
                            setSelectedGroundwaterLevelMeasurement={
                              setSelectedGroundwaterLevelMeasurement
                            }
                            isEditable={isEditable}
                            deleteGroundwaterLevelMeasurement={
                              deleteGroundwaterLevelMeasurement
                            }
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
            {t("msgGroundwaterLevelMeasurementsEmpty")}
          </Typography>
        </FullPageCentered>
      )}
    </FullPage>
  );
};
export default GroundwaterLevelMeasurement;
