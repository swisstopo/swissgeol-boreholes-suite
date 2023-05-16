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
  useFieldMeasurementMutations,
  useFieldMeasurements,
} from "../../../../api/fetchApiV2";
import FieldMeasurementInput from "./fieldMeasurementInput";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay";

const FieldMeasurement = props => {
  const { isEditable, boreholeId } = props;
  const { data: fieldMeasurements, isSuccess } =
    useFieldMeasurements(boreholeId);
  const { t } = useTranslation();
  const {
    add: { mutate: addFieldMeasurement },
    update: { mutate: updateFieldMeasurement },
    delete: { mutate: deleteFieldMeasurement },
  } = useFieldMeasurementMutations();
  const [selectedFieldMeasurement, setSelectedFieldMeasurement] =
    useState(null);
  const [displayedFieldMeasurements, setDisplayedFieldMeasurements] = useState(
    [],
  );

  useEffect(() => {
    setDisplayedFieldMeasurements(fieldMeasurements);
  }, [fieldMeasurements]);

  // scroll to newly added item
  const fieldMeasurementRefs = useMemo(
    () =>
      Array(displayedFieldMeasurements?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedFieldMeasurements],
  );

  useEffect(() => {
    if (displayedFieldMeasurements?.length > 0) {
      const lastFieldMeasurementRef =
        fieldMeasurementRefs[displayedFieldMeasurements?.length - 1];
      if (
        displayedFieldMeasurements[displayedFieldMeasurements?.length - 1]
          .id === 0
      )
        lastFieldMeasurementRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedFieldMeasurements, fieldMeasurementRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Stack direction="row" sx={{ mb: 2 }}>
        <Stack
          direction="row"
          sx={{ visibility: isEditable ? "visible" : "hidden" }}>
          <Typography sx={{ mr: 1 }}>{t("field_measurement")}</Typography>
          <Tooltip title={t("add")}>
            <AddCircleIcon
              data-cy="add-fieldmeasurement-button"
              color={selectedFieldMeasurement === null ? "black" : "disabled"}
              onClick={e => {
                e.stopPropagation();
                if (selectedFieldMeasurement === null) {
                  const tempFieldMeasurement = { id: 0 };
                  setDisplayedFieldMeasurements([
                    ...fieldMeasurements,
                    tempFieldMeasurement,
                  ]);
                  setSelectedFieldMeasurement(tempFieldMeasurement);
                }
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>
      {displayedFieldMeasurements?.length === 0 && (
        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Typography variant="fullPageMessage">
            {t("msgFieldMeasurementsEmpty")}
          </Typography>
        </Stack>
      )}
      <Grid
        container
        alignItems="stretch"
        columnSpacing={{ xs: 2 }}
        rowSpacing={{ xs: 2 }}
        sx={{ overflow: "auto", maxHeight: "85vh" }}>
        {displayedFieldMeasurements?.length > 0 &&
          displayedFieldMeasurements
            ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((gwlm, index) => {
              const isSelected = selectedFieldMeasurement?.id === gwlm.id;
              const isTempGwlm = gwlm.id === 0;
              return (
                <Grid
                  item
                  md={12}
                  lg={12}
                  xl={6}
                  key={index}
                  ref={fieldMeasurementRefs[index]}>
                  {isSuccess ? (
                    isEditable && isSelected ? (
                      <FieldMeasurementInput
                        fieldMeasurement={gwlm}
                        setSelectedFieldMeasurement={
                          setSelectedFieldMeasurement
                        }
                        updateFieldMeasurement={updateFieldMeasurement}
                        addFieldMeasurement={addFieldMeasurement}
                        boreholeId={boreholeId}
                      />
                    ) : (
                      !isTempGwlm && (
                        <FieldMeasurementDisplay
                          fieldMeasurement={gwlm}
                          selectedFieldMeasurement={selectedFieldMeasurement}
                          setSelectedFieldMeasurement={
                            setSelectedFieldMeasurement
                          }
                          isEditable={isEditable}
                          deleteFieldMeasurement={deleteFieldMeasurement}
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
export default FieldMeasurement;
