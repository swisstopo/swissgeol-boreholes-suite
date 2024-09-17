import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import {
  getPrecisionFromString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/legacyComponents/formUtils.js";
import { fetchApiV2 } from "../../../../api/fetchApiV2.js";
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
import { boundingBox, referenceSystems, webApilv03tolv95, webApilv95tolv03 } from "./coordinateSegmentConstants.js";
import { LabelingButton } from "../../../../components/buttons/labelingButton.tsx";
import { useLabelingContext } from "../../labeling/labelingInterfaces.js";
import { FormSegmentBox, StackFullWidth } from "../../../../components/styledComponents.ts";
import { FormSelect } from "../../../../components/form/formSelect.tsx";
import { CoordinatesTextfield } from "./CoordinatesTextfield.tsx";
import { theme } from "../../../../AppTheme.ts";

// --- Function component ---
const CoordinatesSegment: React.FC<CoordinatesSegmentProps> = ({
  size,
  borehole,
  updateChange,
  updateNumber,
  mapPointChange,
  setMapPointChange,
  showLabeling,
  editingEnabled,
}) => {
  const { t } = useTranslation();
  const { panelOpen, togglePanel } = useLabelingContext();

  // --- State variables ---
  const [currentReferenceSystem, setCurrentReferenceSystem] = useState<number>(borehole.data.spatial_reference_system);
  const [boreholeId, setBoreholeId] = useState<number>();

  // --- Form handling ---
  const formMethods = useForm({
    mode: "onChange",
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
      if (locationX && locationY) {
        setValuesForReferenceSystem(refSystem, locationX.toFixed(precisionX), locationY.toFixed(precisionY));
      }
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
      setValuesForReferenceSystem(sourceSystem, X.toFixed(XPrecision), Y.toFixed(YPrecision));

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
    formMethods.setValue("spatial_reference_system", currentReferenceSystem);
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
        const sourceSystem = referenceSystem;
        const targetSystem =
          sourceSystem === ReferenceSystemKey.LV95 ? ReferenceSystemKey.LV03 : ReferenceSystemKey.LV95;
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
    formMethods.setValue("spatial_reference_system", value);
    setValuesForReferenceSystem(ReferenceSystemKey.LV03, "", "");
    setValuesForReferenceSystem(ReferenceSystemKey.LV95, "", "");
  };

  // --- Custom form validation ---
  const inLV95XBounds = (value: string): boolean => {
    const coordinate = parseFloatWithThousandsSeparator(value);
    return boundingBox.LV95.X.Min < coordinate && coordinate < boundingBox.LV95.X.Max;
  };

  const inLV95YBounds = (value: string): boolean => {
    const coordinate = parseFloatWithThousandsSeparator(value);
    return boundingBox.LV95.Y.Min < coordinate && coordinate < boundingBox.LV95.Y.Max;
  };

  const inLV03XBounds = (value: string): boolean => {
    const coordinate = parseFloatWithThousandsSeparator(value);
    return boundingBox.LV03.X.Min < coordinate && coordinate < boundingBox.LV03.X.Max;
  };

  const inLV03YBounds = (value: string): boolean => {
    const coordinate = parseFloatWithThousandsSeparator(value);
    return boundingBox.LV03.Y.Min < coordinate && coordinate < boundingBox.LV03.Y.Max;
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <FormSegmentBox>
          <Card>
            <CardHeader
              title={t("coordinates")}
              sx={{ p: 4, pb: 3 }}
              titleTypographyProps={{ variant: "h5" }}
              action={
                showLabeling && editingEnabled && <LabelingButton disabled={panelOpen} onClick={() => togglePanel()} />
              }
            />
            <CardContent sx={{ pl: 4, pr: 4 }}>
              <StackFullWidth>
                <FormSelect
                  fieldName={`spatial_reference_system`}
                  label="spatial_reference_system"
                  selected={[currentReferenceSystem ?? referenceSystems.LV95.code]}
                  required={true}
                  canReset={false}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    pointerEvents: editingEnabled ? "auto" : "none",
                    boxShadow: panelOpen ? `0px 0px 0px 3px ${theme.palette.ai.main}` : "none",
                  }}
                  inputLabelStyles={{
                    backgroundColor: panelOpen ? "#ffffff" : "none",
                    px: panelOpen ? 1 : 0,
                  }}
                  onUpdate={e => onReferenceSystemChange(e)}
                  values={Object.entries(referenceSystems).map(([, value]) => ({
                    key: value.code,
                    name: value.name,
                  }))}
                />
              </StackFullWidth>
              <Stack direction="row" spacing={2} justifyContent="space-around" mb={2} mt={2}>
                <Stack direction="column" spacing={2} sx={{ flexGrow: 1 }}>
                  <CoordinatesTextfield
                    panelOpen={panelOpen}
                    direction={Direction.X}
                    fieldName={FieldNameDirectionKeys.location_x}
                    editingEnabled={editingEnabled}
                    inBounds={inLV95XBounds}
                    isFieldForSelectedReferenceSystem={currentReferenceSystem === referenceSystems.LV95.code}
                    onCoordinateChange={onCoordinateChange}
                    referenceSystem={ReferenceSystemKey.LV95}
                  />
                  <CoordinatesTextfield
                    panelOpen={panelOpen}
                    direction={Direction.Y}
                    fieldName={FieldNameDirectionKeys.location_y}
                    editingEnabled={editingEnabled}
                    inBounds={inLV95YBounds}
                    isFieldForSelectedReferenceSystem={currentReferenceSystem === referenceSystems.LV95.code}
                    onCoordinateChange={onCoordinateChange}
                    referenceSystem={ReferenceSystemKey.LV95}
                  />
                </Stack>
                <Stack direction="column" spacing={2} sx={{ flexGrow: 1 }}>
                  <CoordinatesTextfield
                    panelOpen={panelOpen}
                    direction={Direction.X}
                    fieldName={FieldNameDirectionKeys.location_x_lv03}
                    editingEnabled={editingEnabled}
                    inBounds={inLV03XBounds}
                    isFieldForSelectedReferenceSystem={currentReferenceSystem === referenceSystems.LV03.code}
                    onCoordinateChange={onCoordinateChange}
                    referenceSystem={ReferenceSystemKey.LV03}
                  />
                  <CoordinatesTextfield
                    panelOpen={panelOpen}
                    direction={Direction.Y}
                    fieldName={FieldNameDirectionKeys.location_y_lv03}
                    editingEnabled={editingEnabled}
                    inBounds={inLV03YBounds}
                    isFieldForSelectedReferenceSystem={currentReferenceSystem === referenceSystems.LV03.code}
                    onCoordinateChange={onCoordinateChange}
                    referenceSystem={ReferenceSystemKey.LV03}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </FormSegmentBox>
      </FormProvider>
      <Form size={size}>
        <FormSegmentBox>
          <Form.Group widths="equal">
            <Form.Field required>
              <label>{t("location_precision")}</label>
              <DomainDropdown
                onSelected={(selected: { id: string }) => {
                  updateChange("location_precision", selected.id, false);
                }}
                schema="location_precision"
                selected={borehole.data.location_precision}
                readOnly={!editingEnabled}
              />
            </Form.Field>
          </Form.Group>
        </FormSegmentBox>
      </Form>
    </>
  );
};

export default CoordinatesSegment;
