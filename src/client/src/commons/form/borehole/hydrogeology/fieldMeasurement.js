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
  useFieldMeasurementMutations,
  useFieldMeasurements,
  useDomains,
} from "../../../../api/fetchApiV2";
import FieldMeasurementInput from "./fieldMeasurementInput";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay";
import { FieldMeasurementParameterUnits } from "./parameterUnits";

const FieldMeasurement = props => {
  const { isEditable, boreholeId } = props;
  const { data: fieldMeasurements, isSuccess } =
    useFieldMeasurements(boreholeId);
  const { data: domains } = useDomains();
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

  const getParameterUnit = parameterId => {
    return FieldMeasurementParameterUnits[
      domains?.find(d => d.id === parameterId)?.geolcode
    ];
  };

  return (
    <FullPage>
      <DataCardButtonContainer>
        {isEditable && (
          <AddButton
            data-cy={"add-fieldmeasurement-button"}
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
            }}>
            {t("addFieldmeasurement")}
          </AddButton>
        )}
      </DataCardButtonContainer>
      {displayedFieldMeasurements?.length > 0 ? (
        <DataCardContainer>
          {displayedFieldMeasurements
            .sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((gwlm, index) => {
              const isSelected = selectedFieldMeasurement?.id === gwlm.id;
              const isTempGwlm = gwlm.id === 0;
              return (
                <DataCardItem key={index} ref={fieldMeasurementRefs[index]}>
                  {isSuccess ? (
                    <DataCard key={gwlm.id}>
                      {isEditable && isSelected ? (
                        <FieldMeasurementInput
                          fieldMeasurement={gwlm}
                          setSelectedFieldMeasurement={
                            setSelectedFieldMeasurement
                          }
                          updateFieldMeasurement={updateFieldMeasurement}
                          addFieldMeasurement={addFieldMeasurement}
                          boreholeId={boreholeId}
                          getParameterUnit={getParameterUnit}
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
                            getParameterUnit={getParameterUnit}
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
            {t("msgFieldMeasurementsEmpty")}
          </Typography>
        </FullPageCentered>
      )}
    </FullPage>
  );
};
export default FieldMeasurement;
