import React, { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@mui/material";
import { fetchApiV2 } from "../../../../api/fetchApiV2.js";
import { LabelingButton } from "../../../../components/buttons/labelingButton.tsx";
import { FormContainer, FormCoordinate, FormSelect } from "../../../../components/form/form";
import { SimpleDomainSelect } from "../../../../components/form/simpleDomainSelect.tsx";
import {
  getPrecisionFromString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/legacyComponents/formUtils.js";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import { Coordinate, ExtractionState, useLabelingContext } from "../../labeling/labelingInterfaces.js";
import { boundingBox, referenceSystems, webApilv03tolv95, webApilv95tolv03 } from "./coordinateSegmentConstants.js";
import {
  CoordinatePrecisions,
  Coordinates,
  CoordinatesSegmentProps,
  Direction,
  FieldNameDirectionKeys,
  Location,
  ReferenceSystemCode,
  ReferenceSystemKey,
} from "./coordinateSegmentInterfaces.js";

// --- Function component ---
const CoordinatesSegment: React.FC<CoordinatesSegmentProps> = ({
  borehole,
  updateChange,
  updateNumber,
  mapPointChange,
  setMapPointChange,
  showLabeling,
  editingEnabled,
}) => {
  const { t } = useTranslation();
  const { extractionObject, setExtractionObject, setExtractionState, extractionState } = useLabelingContext();

  // --- State variables ---
  const [currentReferenceSystem, setCurrentReferenceSystem] = useState<number>(borehole.data.spatial_reference_system);
  const [boreholeId, setBoreholeId] = useState<number>();

  // --- Form handling ---
  const formMethods = useForm({
    mode: "all",
  });

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

  // get location information from coordinates.
  const getLocationInfo = useCallback(async (coordinates: Coordinates): Promise<Location> => {
    return await fetchApiV2(`location/identify?east=${coordinates.LV95.x}&north=${coordinates.LV95.y}`, "GET");
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

  // update all coordinates and precisions on backend.
  const updateCoordinatesWithPrecision = useCallback(
    async (coordinates: Coordinates, precisions: CoordinatePrecisions): Promise<void> => {
      try {
        const location = coordinates.LV95.x && coordinates.LV95.y ? await getLocationInfo(coordinates) : null;

        updateChange(
          "location",
          [
            coordinates.LV95.x,
            coordinates.LV95.y,
            borehole.data.elevation_z,
            location ? location.country : null,
            location ? location.canton : null,
            location ? location.municipality : null,
          ],
          false,
        );
      } catch {
        updateNumber(referenceSystems.LV95.fieldName.X, coordinates.LV95.x);
        updateNumber(referenceSystems.LV95.fieldName.Y, coordinates.LV95.y);
      } finally {
        updateNumber(referenceSystems.LV03.fieldName.X, coordinates.LV03.x);
        updateNumber(referenceSystems.LV03.fieldName.Y, coordinates.LV03.y);
        updateNumber("precision_location_x", precisions.LV95.x);
        updateNumber("precision_location_y", precisions.LV95.y);
        updateNumber("precision_location_x_lv03", precisions.LV03.x);
        updateNumber("precision_location_y_lv03", precisions.LV03.y);
      }
    },
    [borehole.data.elevation_z, getLocationInfo, updateChange, updateNumber],
  );

  // --- Utility functions ---
  const updateFormValues = useCallback(
    (refSystem: string, locationX: number, locationY: number, precisionX: number, precisionY: number) => {
      const locationXString = (locationX && locationX?.toFixed(precisionX)) || "";
      const locationYString = (locationY && locationY?.toFixed(precisionY)) || "";
      setValuesForReferenceSystem(refSystem, locationXString, locationYString);
    },
    [setValuesForReferenceSystem],
  );

  function getCoordinatesFromForm(referenceSystem: string, direction: Direction, value: number): Coordinates {
    const currentFieldName = referenceSystems[referenceSystem].fieldName[direction];

    const LV95XFormValue: string = formMethods.getValues(referenceSystems.LV95.fieldName.X);
    const LV95YFormValue: string = formMethods.getValues(referenceSystems.LV95.fieldName.Y);
    const LV03XFormValue: string = formMethods.getValues(referenceSystems.LV03.fieldName.X);
    const LV03YFormValue: string = formMethods.getValues(referenceSystems.LV03.fieldName.Y);

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

      setValuesForReferenceSystem(targetSystem, transformedX, transformedY);

      updateCoordinatesWithPrecision(
        {
          LV95: {
            x: sourceSystem === ReferenceSystemKey.LV95 ? X : parseFloat(transformedX),
            y: sourceSystem === ReferenceSystemKey.LV95 ? Y : parseFloat(transformedY),
          },
          LV03: {
            x: sourceSystem === ReferenceSystemKey.LV03 ? X : parseFloat(transformedX),
            y: sourceSystem === ReferenceSystemKey.LV03 ? Y : parseFloat(transformedY),
          },
        },
        {
          LV95: {
            x: sourceSystem === ReferenceSystemKey.LV95 ? XPrecision : maxPrecision,
            y: sourceSystem === ReferenceSystemKey.LV95 ? YPrecision : maxPrecision,
          },
          LV03: {
            x: sourceSystem === ReferenceSystemKey.LV03 ? XPrecision : maxPrecision,
            y: sourceSystem === ReferenceSystemKey.LV03 ? YPrecision : maxPrecision,
          },
        },
      );
    },
    [updateCoordinatesWithPrecision, setValuesForReferenceSystem, transformCoordinates],
  );

  //  --- Effect hooks ---

  // initially validate the form to display errors.
  useEffect(() => {
    formMethods.trigger();
  }, [formMethods.trigger, currentReferenceSystem, formMethods]);

  // Sync currentReferenceSystem with react-hook-form
  useEffect(() => {
    formMethods.setValue("spatial_reference_system", currentReferenceSystem, { shouldValidate: true });
  }, [currentReferenceSystem, formMethods]);

  // reset form values when the borehole or map point changes.
  useEffect(() => {
    const shouldUpdateCoordinates = mapPointChange || borehole.data.id !== boreholeId;
    if (shouldUpdateCoordinates) {
      // Update form values for both reference systems
      updateFormValues(
        ReferenceSystemKey.LV95,
        borehole.data.location_x,
        borehole.data.location_y,
        borehole.data.precision_location_x,
        borehole.data.precision_location_y,
      );
      updateFormValues(
        ReferenceSystemKey.LV03,
        borehole.data.location_x_lv03,
        borehole.data.location_y_lv03,
        borehole.data.precision_location_x_lv03,
        borehole.data.precision_location_y_lv03,
      );
      setCurrentReferenceSystem(mapPointChange ? ReferenceSystemCode.LV95 : borehole.data.spatial_reference_system);
      setBoreholeId(borehole.data.id);
    }

    if (mapPointChange && editingEnabled) {
      // set coordinate system to LV95 and transform LV95 coordinates to LV03 with fixed precision of 2.
      setCurrentReferenceSystem(ReferenceSystemCode.LV95);
      setValuesForReferenceSystem(
        ReferenceSystemKey.LV95,
        borehole.data.location_x.toFixed(2),
        borehole.data.location_y.toFixed(2),
      );

      handleCoordinateTransformation(
        ReferenceSystemKey.LV95,
        ReferenceSystemKey.LV03,
        borehole.data.location_x,
        borehole.data.location_y,
        2,
        2,
      ).then(() => setMapPointChange(false));
    }
  }, [
    borehole.data,
    boreholeId,
    mapPointChange,
    setValuesForReferenceSystem,
    transformCoordinates,
    editingEnabled,
    updateCoordinatesWithPrecision,
    setMapPointChange,
    updateNumber,
    currentReferenceSystem,
    updateFormValues,
    handleCoordinateTransformation,
  ]);

  useEffect(() => {
    if (extractionObject?.type === "coordinates" && extractionState === ExtractionState.success) {
      const coordinate = extractionObject.value as Coordinate;
      if (coordinate) {
        setCurrentReferenceSystem(referenceSystems[coordinate.projection].code);
        setValuesForReferenceSystem(coordinate.projection, coordinate.east.toString(), coordinate.north.toString());
      }
    }
  }, [extractionObject, extractionState, setValuesForReferenceSystem]);

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

  // passed to the onChange handler of the reference system radio buttons. Resets the form and updates the reference system.
  const onReferenceSystemChange = (value: ReferenceSystemCode) => {
    if (!editingEnabled) {
      return;
    }
    formMethods.reset(
      {
        location_x: "",
        location_y: "",
        location_x_lv03: "",
        location_y_lv03: "",
      },
      { keepErrors: true },
    );
    updateCoordinatesWithPrecision(
      { LV95: { x: null, y: null }, LV03: { x: null, y: null } },
      { LV95: { x: 0, y: 0 }, LV03: { x: 0, y: 0 } },
    );
    updateNumber("spatial_reference_system", value);
    setCurrentReferenceSystem(value);
    setValuesForReferenceSystem(ReferenceSystemKey.LV03, "", "");
    setValuesForReferenceSystem(ReferenceSystemKey.LV95, "", "");
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
      <FormProvider {...formMethods}>
        <FormSegmentBox>
          <Card data-cy="coordinate-segment">
            <CardHeader
              title={t("coordinates")}
              sx={{ p: 4, pb: 3 }}
              titleTypographyProps={{ variant: "h5" }}
              action={
                showLabeling &&
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
                  required={true}
                  fieldName={`spatial_reference_system`}
                  label="spatial_reference_system"
                  selected={currentReferenceSystem ?? referenceSystems.LV95.code}
                  readonly={!editingEnabled}
                  className={isCoordinateExtraction ? "ai" : ""}
                  onUpdate={e => onReferenceSystemChange(e as number)}
                  values={Object.entries(referenceSystems).map(([, value]) => ({
                    key: value.code,
                    name: value.name,
                  }))}
                />
                <FormContainer direction="row">
                  <FormContainer width={"50%"}>
                    <FormCoordinate
                      required={true}
                      fieldName={FieldNameDirectionKeys.location_x}
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
                      fieldName={FieldNameDirectionKeys.location_y}
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
                      fieldName={FieldNameDirectionKeys.location_x_lv03}
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
                      fieldName={FieldNameDirectionKeys.location_y_lv03}
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
                <SimpleDomainSelect
                  fieldName={`location_precision`}
                  label="location_precision"
                  readonly={!editingEnabled}
                  onUpdate={e => updateChange("location_precision", e ?? null, false)}
                  selected={borehole.data.location_precision}
                  schemaName={"location_precision"}
                />
              </FormContainer>
            </CardContent>
          </Card>
        </FormSegmentBox>
      </FormProvider>
    </>
  );
};

export default CoordinatesSegment;
