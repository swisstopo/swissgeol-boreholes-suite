import React, { useState, useEffect, useMemo, createRef } from "react";
import { useTranslation } from "react-i18next";
import {
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

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
    <Stack sx={{ flexGrow: 1 }}>
      <Stack direction="row" sx={{ mb: 2 }}>
        <Stack
          direction="row"
          sx={{ visibility: isEditable ? "visible" : "hidden" }}>
          <Typography sx={{ mr: 1 }}>
            {t("groundwater_level_measurement")}
          </Typography>
          <Tooltip title={t("add")}>
            <AddCircleIcon
              data-cy="add-groundwaterlevelmeasurement-button"
              color={
                selectedGroundwaterLevelMeasurement === null
                  ? "black"
                  : "disabled"
              }
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
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>
      {displayedGroundwaterLevelMeasurements?.length === 0 && (
        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Typography variant="fullPageMessage">
            {t("msgGroundwaterLevelMeasurementsEmpty")}
          </Typography>
        </Stack>
      )}
      <Grid
        container
        alignItems="stretch"
        columnSpacing={{ xs: 2 }}
        rowSpacing={{ xs: 2 }}
        sx={{ overflow: "auto", maxHeight: "85vh" }}>
        {displayedGroundwaterLevelMeasurements?.length > 0 &&
          displayedGroundwaterLevelMeasurements
            ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((gwlm, index) => {
              const isSelected =
                selectedGroundwaterLevelMeasurement?.id === gwlm.id;
              const isTempGwlm = gwlm.id === 0;
              return (
                <Grid
                  item
                  md={12}
                  lg={12}
                  xl={6}
                  key={index}
                  ref={groundwaterLevelMeasurementRefs[index]}>
                  {isSuccess ? (
                    isEditable && isSelected ? (
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
export default GroundwaterLevelMeasurement;
