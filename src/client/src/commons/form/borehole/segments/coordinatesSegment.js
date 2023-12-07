import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  FormControl,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DomainText from "../../domain/domainText";
import TranslationText from "../../translationText";
import { Form, Segment } from "semantic-ui-react";
import { NumericFormat } from "react-number-format";
import { parseIfString, getPrecision } from "../../formUtils";
import { fetchApiV2 } from "../../../../api/fetchApiV2";

const webApilv95tolv03 = "https://geodesy.geo.admin.ch/reframe/lv95tolv03";
const webApilv03tolv95 = "https://geodesy.geo.admin.ch/reframe/lv03tolv95";

const referenceSystems = {
  LV95: {
    code: 20104001,
    name: "LV95",
    fieldName: { X: "location_x", Y: "location_y" },
  },
  LV03: {
    code: 20104002,
    name: "LV03",
    fieldName: { X: "location_x_lv03", Y: "location_y_lv03" },
  },
};

const CoordinatesSegment = props => {
  const {
    size,
    borehole,
    user,
    updateChange,
    updateNumber,
    checkLock,
    mapPointChange,
    setMapPointChange,
  } = props;

  const [referenceSystem, setReferenceSystem] = useState(borehole.data.srs);
  const [boreholeId, setBoreholeId] = useState();

  const { control, reset, trigger, setValue, getValues } = useForm({
    mode: "onChange",
  });

  const isLV95 =
    referenceSystem === referenceSystems.LV95.code || referenceSystem === null; // LV95 should be selected by default.

  // bounding box of switzerland.
  const coordinateLimits = {
    LV95: {
      X: { Min: 2485869.5728, Max: 2837076.5648 },
      Y: { Min: 1076443.1884, Max: 1299941.7864 },
    },
    LV03: {
      X: { Min: 485870.0968, Max: 837076.3921 },
      Y: { Min: 76442.8707, Max: 299941.9083 },
    },
  };

  const isEditable =
    borehole?.data.role === "EDIT" &&
    borehole?.data.lock !== null &&
    borehole?.data.lock?.username === user?.data.username;

  //initially validate the form to display errors.
  useEffect(() => {
    trigger();
  }, [trigger, referenceSystem]);

  // programmatically set values to form.
  const setValuesForReferenceSystem = useCallback(
    (referenceSystem, X, Y) => {
      setValue(referenceSystems[referenceSystem].fieldName.X, X, {
        shouldValidate: true,
      });
      setValue(referenceSystems[referenceSystem].fieldName.Y, Y, {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  // transforms coordinates from one reference system to the other.
  const transformCoodinates = useCallback(async (referenceSystem, x, y) => {
    let apiUrl;
    if (referenceSystem === referenceSystems.LV95.name) {
      apiUrl = webApilv95tolv03;
    } else {
      apiUrl = webApilv03tolv95;
    }
    if (x && y) {
      const response = await fetch(
        apiUrl + `?easting=${x}&northing=${y}&altitude=0.0&format=json`,
      );
      if (response.ok) {
        return await response.json();
      }
    }
  }, []);

  const getLocationInfo = useCallback(async (x, y) => {
    return await fetchApiV2(`location/identify?east=${x}&north=${y}`, "GET");
  }, []);

  //update all coordinates on backend.
  const updateCoordinates = useCallback(
    async (LV95X, LV95Y, LV03X, LV03Y) => {
      try {
        var location =
          LV95X && LV95Y ? await getLocationInfo(LV95X, LV95Y) : null;

        updateChange(
          "location",
          [
            LV95X,
            LV95Y,
            borehole.data.elevation_z,
            location?.country,
            location?.canton,
            location?.municipality,
          ],
          false,
        );
      } catch {
        updateNumber(referenceSystems.LV95.fieldName.X, LV95X);
        updateNumber(referenceSystems.LV95.fieldName.Y, LV95Y);
      } finally {
        updateNumber(referenceSystems.LV03.fieldName.X, LV03X);
        updateNumber(referenceSystems.LV03.fieldName.Y, LV03Y);
      }
    },
    [borehole.data.elevation_z, getLocationInfo, updateChange, updateNumber],
  );

  // reset form values when the borehole changes.
  useEffect(() => {
    // only update coordinates if borehole id changed or location was changed from map.
    if (mapPointChange || borehole.data.id !== boreholeId) {
      if (borehole.data.location_x && borehole.data.location_y)
        setValuesForReferenceSystem(
          "LV95",
          borehole.data.location_x,
          borehole.data.location_y,
        );
      if (borehole.data.location_x_lv03 && borehole.data.location_y_lv03)
        setValuesForReferenceSystem(
          "LV03",
          borehole.data.location_x_lv03,
          borehole.data.location_y_lv03,
        );
      setReferenceSystem(parseFloat(borehole.data.srs));
      setBoreholeId(borehole.data.id);
    }
    //recalculate LV03 coordinates when LV95 coordinates were changed from map.
    if (mapPointChange) {
      setReferenceSystem(referenceSystems.LV95.code);
      updateNumber("srs", referenceSystems.LV95.code);
      if (isEditable && borehole.data.location_x && borehole.data.location_y) {
        transformCoodinates(
          "LV95",
          borehole.data.location_x,
          borehole.data.location_y,
        ).then(res => {
          const precision = getPrecision(
            borehole.data.location_x,
            borehole.data.location_y,
          );
          const x = parseFloat(parseFloat(res.easting).toFixed(precision));
          const y = parseFloat(parseFloat(res.northing).toFixed(precision));
          setValuesForReferenceSystem("LV03", x, y);
          updateCoordinates(
            borehole.data.location_x,
            borehole.data.location_y,
            x,
            y,
          );
          setMapPointChange(false);
        });
      }
    }
  }, [
    borehole.data,
    boreholeId,
    mapPointChange,
    setValuesForReferenceSystem,
    transformCoodinates,
    borehole,
    isEditable,
    updateCoordinates,
    setMapPointChange,
    updateNumber,
  ]);

  const changeReferenceSystem = value => {
    if (checkLock() === false) {
      return;
    }
    reset(
      {
        LV03X: "",
        LV03Y: "",
        LV95X: "",
        LV95Y: "",
      },
      { keepErrors: true },
    );
    updateCoordinates(null, null, null, null);
    updateNumber("srs", value);
    setReferenceSystem(parseFloat(value));
    setValuesForReferenceSystem("LV03", null, null);
    setValuesForReferenceSystem("LV95", null, null);
  };

  // Gets all current coordinates and sets them to coordinates object.
  const getCoordinatesFromForm = (referenceSystem, direction, value) => {
    const currentFieldName =
      referenceSystems[referenceSystem].fieldName[direction];

    const LV95XFormValue = getValues(referenceSystems.LV95.fieldName.X);
    const LV95YFormValue = getValues(referenceSystems.LV95.fieldName.Y);
    const LV03XFormValue = getValues(referenceSystems.LV03.fieldName.X);
    const LV03YFormValue = getValues(referenceSystems.LV03.fieldName.Y);

    const LV95X =
      currentFieldName === referenceSystems.LV95.fieldName.X
        ? value
        : LV95XFormValue
          ? parseIfString(LV95XFormValue)
          : null;

    const LV95Y =
      currentFieldName === referenceSystems.LV95.fieldName.Y
        ? value
        : LV95XFormValue
          ? parseIfString(LV95YFormValue)
          : null;

    const LV03X =
      currentFieldName === referenceSystems.LV03.fieldName.X
        ? value
        : LV03XFormValue
          ? parseIfString(LV03XFormValue)
          : null;

    const LV03Y =
      currentFieldName === referenceSystems.LV03.fieldName.Y
        ? value
        : LV03XFormValue
          ? parseIfString(LV03YFormValue)
          : null;

    return {
      LV95: {
        X: LV95X,
        Y: LV95Y,
      },
      LV03: {
        X: LV03X,
        Y: LV03Y,
      },
    };
  };

  // Passed to the onChange handler of the location values. Checks bounding box before updating.
  const changeCoordinate = (referenceSystem, direction, value) => {
    if (checkLock() === false) {
      return;
    }
    if (isEditable) {
      const floatValue = parseIfString(value);
      // verify coordinates are in bounding box
      if (
        coordinateLimits[referenceSystem][direction].Min < floatValue &&
        floatValue < coordinateLimits[referenceSystem][direction].Max
      ) {
        const coordinates = getCoordinatesFromForm(
          referenceSystem,
          direction,
          floatValue,
        );
        const completeLV95 = coordinates.LV95.X > 0 && coordinates.LV95.Y > 0;
        const completeLV03 = coordinates.LV03.X > 0 && coordinates.LV03.Y > 0;

        const hasChangedLV95 =
          coordinates.LV95.X !== borehole.data.location_x ||
          coordinates.LV95.Y !== borehole.data.location_y;

        const hasChangedLV03 =
          coordinates.LV03.X !== borehole.data.location_x_lv03 ||
          coordinates.LV03.Y !== borehole.data.location_y_lv03;

        if (referenceSystem === "LV95" && completeLV95 && hasChangedLV95)
          transformCoodinates(
            "LV95",
            coordinates.LV95.X,
            coordinates.LV95.Y,
          ).then(res => {
            const precision = getPrecision(
              coordinates.LV95.X,
              coordinates.LV95.Y,
            );
            const x = parseFloat(parseFloat(res.easting).toFixed(precision));
            const y = parseFloat(parseFloat(res.northing).toFixed(precision));
            setValuesForReferenceSystem("LV03", x, y);
            updateCoordinates(coordinates.LV95.X, coordinates.LV95.Y, x, y);
          });
        if (referenceSystem === "LV03" && completeLV03 && hasChangedLV03) {
          transformCoodinates(
            "LV03",
            coordinates.LV03.X,
            coordinates.LV03.Y,
          ).then(res => {
            const precision = getPrecision(
              coordinates.LV03.X,
              coordinates.LV03.Y,
            );
            const x = parseFloat(parseFloat(res.easting).toFixed(precision));
            const y = parseFloat(parseFloat(res.northing).toFixed(precision));
            setValuesForReferenceSystem("LV95", x, y);
            updateCoordinates(x, y, coordinates.LV03.X, coordinates.LV03.Y);
          });
        }
      }
    }
  };

  // Custom form validation for coodinate inputs with thousand seperators.
  const inLV95XBounds = value => {
    const coordinate = parseIfString(value);

    return (
      coordinateLimits.LV95.X.Min < coordinate &&
      coordinate < coordinateLimits.LV95.X.Max
    );
  };
  const inLV95YBounds = value => {
    const coordinate = parseIfString(value);

    return (
      coordinateLimits.LV95.Y.Min < coordinate &&
      coordinate < coordinateLimits.LV95.Y.Max
    );
  };
  const inLV03XBounds = value => {
    const coordinate = parseIfString(value);

    return (
      coordinateLimits.LV03.X.Min < coordinate &&
      coordinate < coordinateLimits.LV03.X.Max
    );
  };
  const inLV03YBounds = value => {
    const coordinate = parseIfString(value);

    return (
      coordinateLimits.LV03.Y.Min < coordinate &&
      coordinate < coordinateLimits.LV03.Y.Max
    );
  };

  return (
    <Segment>
      <Form size={size}>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="srs" />
            </label>
            <Controller
              name="srs"
              control={control}
              defaultValue={referenceSystems.LV95.code}
              render={({ field }) => (
                <FormControl {...field} className="radio-group">
                  <RadioGroup
                    row
                    value={referenceSystem ?? referenceSystems.LV95.code}
                    onChange={e => changeReferenceSystem(e.target.value)}>
                    <FormControlLabel
                      value={referenceSystems.LV95.code}
                      sx={{ flexGrow: 1 }}
                      control={<Radio />}
                      label={
                        <DomainText
                          id={referenceSystems.LV95.code}
                          schema="srs"
                        />
                      }
                    />
                    <FormControlLabel
                      value={referenceSystems.LV03.code}
                      sx={{ flexGrow: 1 }}
                      control={<Radio />}
                      label={
                        <DomainText
                          id={referenceSystems.LV03.code}
                          schema="srs"
                        />
                      }
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Form.Field>
        </Form.Group>
        <Box>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-around"
            mb={2}>
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
                    <label>
                      <TranslationText id="location_x_LV95" />
                    </label>
                    <NumericFormat
                      data-cy="LV95X"
                      type="text"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={!isLV95}
                      onChange={e => {
                        changeCoordinate("LV95", "X", e.target.value);
                      }}
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
                    <label>
                      <TranslationText id="location_y_LV95" />
                    </label>
                    <NumericFormat
                      data-cy="LV95Y"
                      type="text"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={!isLV95}
                      onChange={e => {
                        changeCoordinate("LV95", "Y", e.target.value);
                      }}
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
                    <label>
                      <TranslationText id="location_x_LV03" />
                    </label>
                    <NumericFormat
                      type="text"
                      data-cy="LV03X"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={isLV95}
                      onChange={e => {
                        changeCoordinate("LV03", "X", e.target.value);
                      }}
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
                    <label>
                      <TranslationText id="location_y_LV03" />
                    </label>
                    <NumericFormat
                      data-cy="LV03Y"
                      type="text"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      readOnly={isLV95}
                      onChange={e => {
                        changeCoordinate("LV03", "Y", e.target.value);
                      }}
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
            <label>
              <TranslationText id="qt_location" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("qt_location", selected.id, false);
              }}
              schema="qt_location"
              selected={borehole.data.qt_location}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.elevation_z == null} required>
            <label>
              <TranslationText id="elevation_z" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "elevation_z",
                  e.target.value === "" ? null : parseIfString(e.target.value),
                );
              }}
              spellCheck="false"
              value={borehole.data.elevation_z ?? ""}
              thousandSeparator="'"
            />
          </Form.Field>

          <Form.Field required>
            <label>
              <TranslationText id="qt_elevation" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("qt_elevation", selected.id, false);
              }}
              schema="qt_elevation"
              selected={borehole.data.qt_elevation}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            error={borehole.data.reference_elevation == null}
            required>
            <label>
              <TranslationText id="reference_elevation" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "reference_elevation",
                  e.target.value === "" ? null : parseIfString(e.target.value),
                );

                if (/^-?\d*[.,]?\d*$/.test(e.target.value)) {
                  updateChange(
                    "reference_elevation",
                    e.target.value === "" ? null : parseFloat(e.target.value),
                  );
                }
              }}
              spellCheck="false"
              value={borehole.data.reference_elevation ?? ""}
              thousandSeparator="'"
            />
          </Form.Field>
          <Form.Field required>
            <label>
              <TranslationText id="reference_elevation_qt" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("qt_reference_elevation", selected.id, false);
              }}
              schema="qt_elevation"
              selected={borehole.data.qt_reference_elevation}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            error={borehole.data.reference_elevation_type === null}
            required>
            <label>
              <TranslationText id="reference_elevation_type" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("reference_elevation_type", selected.id, false);
              }}
              schema="ibor117"
              selected={borehole.data.reference_elevation_type}
            />
          </Form.Field>
          <Form.Field required>
            <label>
              <TranslationText id="hrs" />
            </label>
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
              }}>
              <div>
                <DomainText id={borehole.data.hrs} schema="hrs" />
              </div>
            </div>
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default CoordinatesSegment;
