import React, { useCallback, useEffect, useState } from "react";
import { Box, FormControl, FormControlLabel, RadioGroup, Stack } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Form, Segment } from "semantic-ui-react";
import { NumericFormat } from "react-number-format";
import { useTranslation } from "react-i18next";
import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import DomainText from "../../../../components/legacyComponents/domain/domainText.jsx";
import {
  getPrecisionFromString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/legacyComponents/formUtils.js";
import { fetchApiV2 } from "../../../../api/fetchApiV2.js";
import { DisabledRadio } from "../styledComponents.jsx";
import {
  CoordinatePrecisions,
  Coordinates,
  CoordinatesSegmentProps,
  Direction,
  FormValues,
  Location,
  ReferenceSystemCode,
  ReferenceSystemKey,
} from "./coordinateSegmentInterfaces.js";
import { boundingBox, referenceSystems, webApilv03tolv95, webApilv95tolv03 } from "./coordinateSegmentConstants.js";

// --- Function component ---
const CoordinatesSegment: React.FC<CoordinatesSegmentProps> = ({
  borehole,
  user,
  updateChange,
  updateNumber,
  checkLock,
  mapPointChange,
  setMapPointChange,
}) => {
  const { t } = useTranslation();

  // --- State variables ---
  const [currentReferenceSystem, setCurrentReferenceSystem] = useState<number>(borehole.data.spatial_reference_system);
  const [boreholeId, setBoreholeId] = useState<number>();

  // --- Form handling ---
  const { control, reset, trigger, setValue, getValues } = useForm<FormValues>({
    mode: "onChange",
  });

  // --- Derived states ---
  const isLV95 = currentReferenceSystem === referenceSystems.LV95.code || currentReferenceSystem === null; // LV95 should be selected by default.
  const isEditable: boolean =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

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
      setValue(referenceSystems[referenceSystem].fieldName.X, X, {
        shouldValidate: true,
      });
      setValue(referenceSystems[referenceSystem].fieldName.Y, Y, {
        shouldValidate: true,
      });
    },
    [setValue],
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

    const LV95XFormValue: string = getValues(referenceSystems.LV95.fieldName.X);
    const LV95YFormValue: string = getValues(referenceSystems.LV95.fieldName.Y);
    const LV03XFormValue: string = getValues(referenceSystems.LV03.fieldName.X);
    const LV03YFormValue: string = getValues(referenceSystems.LV03.fieldName.Y);

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
    trigger();
  }, [trigger, currentReferenceSystem]);

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

    if (mapPointChange && isEditable) {
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
    isEditable,
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
    if (!checkLock()) {
      return;
    }
    // prevent decimal point being removed when typing
    if (value.endsWith(".")) {
      return;
    }
    if (isEditable) {
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
              ? getValues(referenceSystems[referenceSystem].fieldName.Y)
              : getValues(referenceSystems[referenceSystem].fieldName.X),
          );
          const X_precision = direction === Direction.X ? changedCoordinatePrecision : otherCoordinatePrecision;
          const Y_precision = direction === Direction.Y ? changedCoordinatePrecision : otherCoordinatePrecision;

          if (X !== null && Y !== null) {
            handleCoordinateTransformation(sourceSystem, targetSystem, X, Y, X_precision, Y_precision);
          }
        }
      }
    }
  };

  // passed to the onChange handler of the reference system radio buttons. Resets the form and updates the reference system.
  const onReferenceSystemChange = (value: ReferenceSystemCode) => {
    if (!checkLock()) {
      return;
    }
    reset(
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
    <Segment>
      <Form>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>{t("spatial_reference_system")}</label>
            <Controller
              name="spatial_reference_system"
              control={control}
              defaultValue={referenceSystems.LV95.code}
              render={({ field }) => (
                <FormControl {...field} className="radio-group">
                  <RadioGroup
                    row
                    value={currentReferenceSystem ?? referenceSystems.LV95.code}
                    onChange={e => onReferenceSystemChange(parseFloat(e.target.value))}>
                    <FormControlLabel
                      value={referenceSystems.LV95.code}
                      sx={{ flexGrow: 1 }}
                      control={<DisabledRadio isEditable={!isEditable} />}
                      label={<DomainText id={referenceSystems.LV95.code} schema="spatial_reference_system" />}
                    />
                    <FormControlLabel
                      value={referenceSystems.LV03.code}
                      sx={{ flexGrow: 1 }}
                      control={<DisabledRadio isEditable={!isEditable} />}
                      label={<DomainText id={referenceSystems.LV03.code} schema="spatial_reference_system" />}
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Form.Field>
        </Form.Group>
        <Box>
          <Stack direction="row" spacing={2} justifyContent="space-around" mb={2}>
            <Stack direction="column" sx={{ flexGrow: 1 }}>
              <Controller
                name="location_x"
                control={control}
                rules={{
                  required: true,
                  validate: inLV95XBounds,
                }}
                render={({ field, fieldState: { error } }) => (
                  <Form.Field
                    {...field}
                    style={{
                      opacity: !isLV95 ? 0.6 : 1,
                      pointerEvents: !isLV95 ? "none" : "auto",
                    }}
                    error={error !== undefined}>
                    <label>{t("location_x_LV95")}</label>
                    <NumericFormat
                      data-cy="LV95X"
                      type="text"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={!isLV95 || !isEditable}
                      onChange={e => {
                        onCoordinateChange(ReferenceSystemKey.LV95, Direction.X, String(e.target.value));
                      }}
                      fixedDecimalScale
                      spellCheck="false"
                      value={field.value || ""}
                      thousandSeparator="'"
                    />
                  </Form.Field>
                )}
              />
              <Controller
                name="location_y"
                control={control}
                rules={{
                  required: true,
                  validate: inLV95YBounds,
                }}
                render={({ field, fieldState: { error } }) => (
                  <Form.Field
                    {...field}
                    style={{
                      opacity: !isLV95 ? 0.6 : 1,
                      pointerEvents: !isLV95 ? "none" : "auto",
                    }}
                    error={error !== undefined}>
                    <label>{t("location_y_LV95")}</label>
                    <NumericFormat
                      data-cy="LV95Y"
                      type="text"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={!isLV95 || !isEditable}
                      onChange={e => {
                        onCoordinateChange(ReferenceSystemKey.LV95, Direction.Y, String(e.target.value));
                      }}
                      fixedDecimalScale
                      spellCheck="false"
                      value={field.value || ""}
                      thousandSeparator="'"
                    />
                  </Form.Field>
                )}
              />
            </Stack>
            <Stack direction="column" spacing={2} sx={{ flexGrow: 1 }}>
              <Controller
                name="location_x_lv03"
                control={control}
                rules={{
                  required: true,
                  validate: inLV03XBounds,
                }}
                render={({ field, fieldState: { error } }) => (
                  <Form.Field
                    {...field}
                    style={{
                      opacity: isLV95 ? 0.6 : 1,
                      pointerEvents: isLV95 ? "none" : "auto",
                    }}
                    error={error !== undefined}>
                    <label>{t("location_x_LV03")}</label>
                    <NumericFormat
                      type="text"
                      data-cy="LV03X"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={isLV95 || !isEditable}
                      onChange={e => {
                        onCoordinateChange(ReferenceSystemKey.LV03, Direction.X, String(e.target.value));
                      }}
                      valueIsNumericString
                      spellCheck="false"
                      value={field.value || ""}
                      thousandSeparator="'"
                    />
                  </Form.Field>
                )}
              />
              <Controller
                name="location_y_lv03"
                control={control}
                rules={{
                  required: true,
                  validate: inLV03YBounds,
                }}
                render={({ field, fieldState: { error } }) => (
                  <Form.Field
                    {...field}
                    style={{
                      opacity: isLV95 ? 0.6 : 1,
                      pointerEvents: isLV95 ? "none" : "auto",
                    }}
                    error={error !== undefined}>
                    <label>{t("location_y_LV03")}</label>
                    <NumericFormat
                      data-cy="LV03Y"
                      type="text"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={isLV95 || !isEditable}
                      onChange={e => {
                        onCoordinateChange(ReferenceSystemKey.LV03, Direction.Y, String(e.target.value));
                      }}
                      fixedDecimalScale
                      spellCheck="false"
                      value={field.value || ""}
                      thousandSeparator="'"
                    />
                  </Form.Field>
                )}
              />
            </Stack>
          </Stack>
        </Box>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>{t("location_precision")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string }) => {
                updateChange("location_precision", selected.id, false);
              }}
              schema="location_precision"
              selected={borehole.data.location_precision}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.elevation_z == null} required>
            <label>{t("elevation_z")}</label>
            <NumericFormat
              type="text"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "elevation_z",
                  e.target.value === "" ? null : parseFloatWithThousandsSeparator(e.target.value),
                );
              }}
              fixedDecimalScale
              spellCheck="false"
              value={borehole.data.elevation_z ?? ""}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>

          <Form.Field required>
            <label>{t("elevation_precision")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string }) => {
                updateChange("elevation_precision", selected.id, false);
              }}
              schema="elevation_precision"
              selected={borehole.data.elevation_precision}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.reference_elevation == null} required>
            <label>{t("reference_elevation")}</label>
            <NumericFormat
              autoCapitalize="off"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "reference_elevation",
                  e.target.value === "" ? null : parseFloatWithThousandsSeparator(e.target.value),
                );
                if (/^-?\d*[.,]?\d*$/.test(e.target.value)) {
                  updateChange("reference_elevation", e.target.value === "" ? null : parseFloat(e.target.value));
                }
              }}
              spellCheck="false"
              value={borehole.data.reference_elevation ?? ""}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>{t("reference_elevation_qt")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string | number }) => {
                updateChange("qt_reference_elevation", selected.id, false);
              }}
              schema="elevation_precision"
              selected={borehole.data.qt_reference_elevation}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.reference_elevation_type === null} required>
            <label>{t("reference_elevation_type")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string }) => {
                updateChange("reference_elevation_type", selected.id, false);
              }}
              schema="reference_elevation_type"
              selected={borehole.data.reference_elevation_type}
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>{t("height_reference_system")}</label>
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
              }}>
              <div>
                <DomainText id={borehole.data.height_reference_system} schema="height_reference_system" />
              </div>
            </div>
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default CoordinatesSegment;
