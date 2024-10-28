import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@mui/material";
import { fetchApiV2 } from "../../../../api/fetchApiV2";
import { LabelingButton } from "../../../../components/buttons/labelingButton";
import { FormContainer, FormCoordinate, FormDomainSelect, FormSelect } from "../../../../components/form/form";
import {
  getPrecisionFromString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/legacyComponents/formUtils.js";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { Coordinate, ExtractionState, useLabelingContext } from "../../labeling/labelingInterfaces";
import { boundingBox, referenceSystems, webApilv03tolv95, webApilv95tolv03 } from "./coordinateSegmentConstants";
import {
  Coordinates,
  CoordinatesSegmentProps,
  Direction,
  FieldNameDirectionKeys,
  Location,
  ReferenceSystemCode,
  ReferenceSystemKey,
} from "./coordinateSegmentInterfaces";

// --- Function component ---
const CoordinatesSegment: React.FC<CoordinatesSegmentProps> = ({
  borehole,
  mapPointChange,
  setMapPointChange,
  editingEnabled,
  formMethods,
}) => {
  const { t } = useTranslation();
  const { extractionObject, setExtractionObject, setExtractionState, extractionState } = useLabelingContext();

  // --- State variables ---
  const [boreholeId, setBoreholeId] = useState<number>();
  const currentReferenceSystem = formMethods.watch("originalReferenceSystem");

  // --- UseCallback hooks ---

  // transforms coordinates from one reference system to the other.
  const transformCoordinates = useCallback(async (referenceSystem: string, x: number, y: number) => {
    let apiUrl;
    if (referenceSystem === referenceSystems.LV95.name) {
      apiUrl = webApilv95tolv03;
    } else {
      apiUrl = webApilv03tolv95;
    }
    if (x && y) {
      const response = await fetch(apiUrl + `?easting=${x}&northing=${y}&altitude=0.0&format=json`);
      if (response.ok) {
        return await response.json();
      }
    }
  }, []);

  // programmatically set values to form.
  const setValuesForReferenceSystem = useCallback(
    (referenceSystem: string, X: string, Y: string) => {
      formMethods.setValue(referenceSystems[referenceSystem].fieldName.X, X, {
        shouldValidate: true,
      });
      formMethods.setValue(referenceSystems[referenceSystem].fieldName.Y, Y, {
        shouldValidate: true,
      });
    },
    [formMethods],
  );

  const setValuesForCountryCantonMunicipality = useCallback(
    (location: Location) => {
      for (const [key, value] of Object.entries(location) as [keyof Location, string][]) {
        formMethods.setValue(key, value, {
          shouldValidate: true,
        });
      }
    },
    [formMethods],
  );

  // --- Utility functions ---
  const updateFormValues = useCallback(
    (refSystem: string, locationX: number | null, locationY: number | null, precisionX: number, precisionY: number) => {
      const locationXString = (locationX && locationX?.toFixed(precisionX)) || "";
      const locationYString = (locationY && locationY?.toFixed(precisionY)) || "";
      console.log("use form values");
      setValuesForReferenceSystem(refSystem, locationXString, locationYString);
    },
    [setValuesForReferenceSystem],
  );

  function getCoordinatesFromForm(referenceSystem: string, direction: Direction, value: number): Coordinates {
    const currentFieldName = referenceSystems[referenceSystem].fieldName[direction];

    const LV95XFormValue: string = formMethods.getValues(referenceSystems.LV95.fieldName.X) as string;
    const LV95YFormValue: string = formMethods.getValues(referenceSystems.LV95.fieldName.Y) as string;
    const LV03XFormValue: string = formMethods.getValues(referenceSystems.LV03.fieldName.X) as string;
    const LV03YFormValue: string = formMethods.getValues(referenceSystems.LV03.fieldName.Y) as string;

    const LV95X =
      currentFieldName === referenceSystems.LV95.fieldName.X
        ? value
        : LV95XFormValue
          ? parseFloatWithThousandsSeparator(LV95XFormValue)
          : null;

    const LV95Y =
      currentFieldName === referenceSystems.LV95.fieldName.Y
        ? value
        : LV95XFormValue
          ? parseFloatWithThousandsSeparator(LV95YFormValue)
          : null;

    const LV03X =
      currentFieldName === referenceSystems.LV03.fieldName.X
        ? value
        : LV03XFormValue
          ? parseFloatWithThousandsSeparator(LV03XFormValue)
          : null;

    const LV03Y =
      currentFieldName === referenceSystems.LV03.fieldName.Y
        ? value
        : LV03XFormValue
          ? parseFloatWithThousandsSeparator(LV03YFormValue)
          : null;

    return {
      LV95: { x: LV95X, y: LV95Y },
      LV03: { x: LV03X, y: LV03Y },
    };
  }

  const handleCoordinateTransformation = useCallback(
    async (
      sourceSystem: ReferenceSystemKey,
      targetSystem: ReferenceSystemKey,
      X: number,
      Y: number,
      XPrecision: number,
      YPrecision: number,
    ) => {
      const response = await transformCoordinates(sourceSystem, X, Y);
      if (!response) return; // Ensure response is valid

      const maxPrecision = Math.max(XPrecision, YPrecision);
      const transformedX = parseFloat(response.easting).toFixed(maxPrecision);
      const transformedY = parseFloat(response.northing).toFixed(maxPrecision);

      const location = await fetchApiV2(`location/identify?east=${X}&north=${Y}`, "GET");
      setValuesForCountryCantonMunicipality(location);
      setValuesForReferenceSystem(targetSystem, transformedX, transformedY);
    },
    [setValuesForCountryCantonMunicipality, setValuesForReferenceSystem, transformCoordinates],
  );

  //  --- Effect hooks ---

  // initially validate the form to display errors.
  useEffect(() => {
    formMethods.trigger();
  }, [formMethods.trigger, currentReferenceSystem, formMethods]);

  // reset form values when the borehole or map point changes.
  useEffect(() => {
    const shouldUpdateCoordinates = mapPointChange || borehole.id !== boreholeId;
    if (shouldUpdateCoordinates) {
      // Update form values for both reference systems
      updateFormValues(
        ReferenceSystemKey.LV95,
        borehole.locationX,
        borehole.locationY,
        borehole.precisionLocationX,
        borehole.precisionLocationY,
      );
      updateFormValues(
        ReferenceSystemKey.LV03,
        borehole.locationXLV03,
        borehole.locationYLV03,
        borehole.precisionLocationXLV03,
        borehole.precisionLocationYLV03,
      );
      setBoreholeId(borehole.id);
    }

    if (mapPointChange && editingEnabled) {
      // set coordinate system to LV95 and transform LV95 coordinates to LV03 with fixed precision of 2.
      formMethods.setValue("originalReferenceSystem", ReferenceSystemCode.LV95);
      setValuesForReferenceSystem(
        ReferenceSystemKey.LV95,
        borehole.locationX?.toFixed(2) || "",
        borehole.locationY?.toFixed(2) || "",
      );

      handleCoordinateTransformation(
        ReferenceSystemKey.LV95,
        ReferenceSystemKey.LV03,
        borehole.locationX!,
        borehole.locationY!,
        2,
        2,
      ).then(() => setMapPointChange(false));
    }
  }, [
    borehole,
    boreholeId,
    mapPointChange,
    setValuesForReferenceSystem,
    transformCoordinates,
    editingEnabled,
    setMapPointChange,
    updateFormValues,
    handleCoordinateTransformation,
    formMethods,
  ]);

  useEffect(() => {
    if (extractionObject?.type === "coordinates" && extractionState === ExtractionState.success) {
      const coordinate = extractionObject.value as Coordinate;
      if (coordinate) {
        formMethods.setValue("originalReferenceSystem", referenceSystems[coordinate.projection].code);
        setValuesForReferenceSystem(coordinate.projection, coordinate.east.toString(), coordinate.north.toString());
      }
    }
  }, [extractionObject, extractionState, formMethods, setValuesForReferenceSystem]);

  const isCoordinateExtraction = extractionObject?.type === "coordinates";

  // --- Event handlers --- /

  // passed to the onChange handler of the location values. Checks bounding box before updating.
  const onCoordinateChange = (referenceSystem: ReferenceSystemKey, direction: Direction, value: string) => {
    if (!editingEnabled) {
      return;
    }
    // prevent decimal point being removed when typing
    if (value.endsWith(".")) {
      return;
    }
    const sourceSystem = referenceSystem;
    const targetSystem = sourceSystem === ReferenceSystemKey.LV95 ? ReferenceSystemKey.LV03 : ReferenceSystemKey.LV95;

    if (value === "") {
      setValuesForReferenceSystem(targetSystem, "", "");
      return;
    }

    const floatValue = parseFloatWithThousandsSeparator(value);
    // verify coordinates are in bounding box
    if (
      boundingBox[referenceSystem][direction].Min < floatValue &&
      floatValue < boundingBox[referenceSystem][direction].Max
    ) {
      const coordinates: Coordinates = getCoordinatesFromForm(referenceSystem, direction, floatValue);

      const completeLV95 =
        coordinates?.LV95.x != null &&
        coordinates?.LV95.x > 0 &&
        coordinates?.LV95.y !== null &&
        coordinates?.LV95.y > 0;

      const completeLV03 =
        coordinates?.LV03.x !== null &&
        coordinates?.LV03.x > 0 &&
        coordinates?.LV03.y !== null &&
        coordinates?.LV03.y > 0;

      if (
        (referenceSystem === ReferenceSystemKey.LV95 && completeLV95) ||
        (referenceSystem === ReferenceSystemKey.LV03 && completeLV03)
      ) {
        const X = sourceSystem === ReferenceSystemKey.LV95 ? coordinates?.LV95.x : coordinates?.LV03.x;
        const Y = sourceSystem === ReferenceSystemKey.LV95 ? coordinates?.LV95.y : coordinates?.LV03.y;
        const changedCoordinatePrecision = getPrecisionFromString(value);
        const otherCoordinatePrecision = getPrecisionFromString(
          direction === Direction.X
            ? formMethods.getValues(referenceSystems[referenceSystem].fieldName.Y)
            : formMethods.getValues(referenceSystems[referenceSystem].fieldName.X),
        );
        const X_precision = direction === Direction.X ? changedCoordinatePrecision : otherCoordinatePrecision;
        const Y_precision = direction === Direction.Y ? changedCoordinatePrecision : otherCoordinatePrecision;

        if (X !== null && Y !== null && !mapPointChange) {
          handleCoordinateTransformation(sourceSystem, targetSystem, X, Y, X_precision, Y_precision);
        }
      }
    }
  };

  // Resets the form and updates the reference system.
  const resetCoordinatesOnReferenceSystemChange = () => {
    setValuesForReferenceSystem(ReferenceSystemKey.LV03, "", "");
    setValuesForReferenceSystem(ReferenceSystemKey.LV95, "", "");
    setValuesForCountryCantonMunicipality({ country: "", canton: "", municipality: "" });
  };

  const startLabeling = () => {
    const referenceSystemKey =
      currentReferenceSystem === referenceSystems.LV95.code ? ReferenceSystemKey.LV95 : ReferenceSystemKey.LV03;
    setExtractionObject({
      type: "coordinates",
      previousValue: {
        east: formMethods.getValues(referenceSystems[referenceSystemKey].fieldName.X),
        north: formMethods.getValues(referenceSystems[referenceSystemKey].fieldName.Y),
        projection: referenceSystemKey,
      },
    });
    setExtractionState(ExtractionState.start);
  };

  return (
    <>
      {borehole && (
        <FormSegmentBox>
          <Card data-cy="coordinate-segment">
            <CardHeader
              title={t("coordinates")}
              sx={{ p: 4, pb: 3 }}
              titleTypographyProps={{ variant: "h5" }}
              action={
                editingEnabled && (
                  <LabelingButton
                    className={extractionObject?.type === "coordinates" ? "Mui-active" : ""}
                    onClick={() => startLabeling()}
                  />
                )
              }
            />
            <CardContent sx={{ pt: 4, px: 3 }}>
              <FormContainer>
                <FormSelect
                  canReset={false}
                  fieldName={"originalReferenceSystem"}
                  label="spatial_reference_system"
                  selected={borehole.originalReferenceSystem}
                  readonly={!editingEnabled}
                  className={isCoordinateExtraction ? "ai" : ""}
                  onUpdate={resetCoordinatesOnReferenceSystemChange}
                  values={Object.entries(referenceSystems).map(([, value]) => ({
                    key: value.code,
                    name: value.name,
                  }))}
                />
                <FormContainer direction="row">
                  <FormContainer width={"50%"}>
                    <FormCoordinate
                      required={true}
                      fieldName={FieldNameDirectionKeys.locationX}
                      referenceSystem={ReferenceSystemKey.LV95}
                      direction={Direction.X}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV95.code}
                      readonly={!editingEnabled}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.getValues(referenceSystems.LV95.fieldName.X)}
                    />
                    <FormCoordinate
                      required={true}
                      fieldName={FieldNameDirectionKeys.locationY}
                      referenceSystem={ReferenceSystemKey.LV95}
                      direction={Direction.Y}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV95.code}
                      readonly={!editingEnabled}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.getValues(referenceSystems.LV95.fieldName.Y)}
                    />
                  </FormContainer>
                  <FormContainer width={"50%"}>
                    <FormCoordinate
                      required={true}
                      fieldName={FieldNameDirectionKeys.locationXLV03}
                      referenceSystem={ReferenceSystemKey.LV03}
                      direction={Direction.X}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV03.code}
                      readonly={!editingEnabled}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.getValues(referenceSystems.LV03.fieldName.X)}
                    />
                    <FormCoordinate
                      required={true}
                      fieldName={FieldNameDirectionKeys.locationYLV03}
                      referenceSystem={ReferenceSystemKey.LV03}
                      direction={Direction.Y}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV03.code}
                      readonly={!editingEnabled}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.getValues(referenceSystems.LV03.fieldName.Y)}
                    />
                  </FormContainer>
                </FormContainer>
                <FormDomainSelect
                  fieldName={"locationPrecisionId"}
                  label="location_precision"
                  schemaName={"location_precision"}
                  readonly={!editingEnabled}
                  selected={borehole.locationPrecisionId}
                />
              </FormContainer>
            </CardContent>
          </Card>
        </FormSegmentBox>
      )}
    </>
  );
};

export default CoordinatesSegment;
