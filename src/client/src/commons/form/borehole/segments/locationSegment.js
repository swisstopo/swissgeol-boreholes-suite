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
import { Form, Input, Segment } from "semantic-ui-react";

const webApilv95tolv03 = "http://geodesy.geo.admin.ch/reframe/lv95tolv03";
const webApilv03tolv95 = "http://geodesy.geo.admin.ch/reframe/lv03tolv95";

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

const LocationSegment = props => {
  const {
    size,
    mentions,
    borehole,
    user,
    updateChange,
    updateNumber,
    checkLock,
  } = props;

  const [referenceSystem, setReferenceSystem] = useState(borehole.data.srs);
  const [coordinates, setCoordinates] = useState({
    LV95: { X: null, Y: null },
    LV03: { X: null, Y: null },
  });

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

  //initially validate the form to display errors.
  useEffect(() => {
    trigger();
  }, [trigger, referenceSystem]);

  // set programmatically set values to form.
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

  // Reset form values when the borehole changes.
  useEffect(() => {
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
    setCoordinates({
      LV95: { X: borehole.data.location_x, Y: borehole.data.location_y },
      LV03: {
        X: borehole.data.location_x_lv03,
        Y: borehole.data.location_y_lv03,
      },
    });
    setReferenceSystem(parseFloat(borehole.data.srs));
  }, [borehole, setValuesForReferenceSystem, transformCoodinates]);

  //update all coordinates on backend.
  const updateCoordinates = useCallback(
    (LV95X, LV95Y, LV03X, LV03Y) => {
      const isEditable =
        borehole?.data.role === "EDIT" &&
        borehole?.data.lock !== null &&
        borehole?.data.lock?.username === user?.data.username;

      if (isEditable) {
        updateNumber(referenceSystems.LV95.fieldName.X, LV95X);
        updateNumber(referenceSystems.LV95.fieldName.Y, LV95Y);
        updateNumber(referenceSystems.LV03.fieldName.X, LV03X);
        updateNumber(referenceSystems.LV03.fieldName.Y, LV03Y);
      }
    },
    [borehole, updateNumber, user],
  );

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
    updateNumber(referenceSystems.LV95.fieldName.X, null);
    updateNumber(referenceSystems.LV95.fieldName.Y, null);
    updateNumber(referenceSystems.LV03.fieldName.X, null);
    updateNumber(referenceSystems.LV03.fieldName.Y, null);
    updateNumber("srs", value);
    setCoordinates({ LV95: { X: null, Y: null }, LV03: { X: null, Y: null } });
    setReferenceSystem(parseFloat(value));
  };

  // Gets all current coordinates and sets them to coordinates object.
  const getCoordinatesFromForm = (referenceSystem, direction, value) => {
    const currentFieldName =
      referenceSystems[referenceSystem].fieldName[direction];

    const LV95X =
      currentFieldName === referenceSystems.LV95.fieldName.X
        ? parseFloat(value)
        : parseFloat(getValues(referenceSystems.LV95.fieldName.X));
    const LV95Y =
      currentFieldName === referenceSystems.LV95.fieldName.Y
        ? parseFloat(value)
        : parseFloat(getValues(referenceSystems.LV95.fieldName.Y));

    const LV03X =
      currentFieldName === referenceSystems.LV03.fieldName.X
        ? parseFloat(value)
        : parseFloat(getValues(referenceSystems.LV03.fieldName.X));

    const LV03Y =
      currentFieldName === referenceSystems.LV03.fieldName.Y
        ? parseFloat(value)
        : parseFloat(getValues(referenceSystems.LV03.fieldName.Y));

    setCoordinates({
      LV95: {
        X: LV95X,
        Y: LV95Y,
      },
      LV03: {
        X: LV03X,
        Y: LV03Y,
      },
    });
    // }
  };

  // Passed to the onChange handler of the location values. Checks bounding box before updating.
  const changeCoordinate = (referenceSystem, direction, value) => {
    if (checkLock() === false) {
      return;
    }

    if (
      coordinateLimits[referenceSystem][direction].Min < value &&
      value < coordinateLimits[referenceSystem][direction].Max
    ) {
      getCoordinatesFromForm(referenceSystem, direction, value);
    }
  };

  // Transforms and updates the coordinates if location changes.
  useEffect(() => {
    const completeLV95 = coordinates.LV95.X > 0 && coordinates.LV95.Y > 0;
    const completeLV03 = coordinates.LV03.X > 0 && coordinates.LV03.Y > 0;

    const hasChangedLV95 =
      coordinates.LV95.X !== borehole.data.location_x ||
      coordinates.LV95.Y !== borehole.data.location_y;

    const hasChangedLV03 =
      coordinates.LV03.X !== borehole.data.location_x_lv03 ||
      coordinates.LV03.Y !== borehole.data.location_y_lv03;

    if (
      referenceSystem === referenceSystems.LV95.code &&
      completeLV95 &&
      hasChangedLV95
    )
      transformCoodinates("LV95", coordinates.LV95.X, coordinates.LV95.Y).then(
        res => {
          setValuesForReferenceSystem("LV03", res.easting, res.northing);
          console.log("update lv 95");
          updateCoordinates(
            coordinates.LV95.X,
            coordinates.LV95.Y,
            res.easting,
            res.northing,
          );
        },
      );
    if (
      referenceSystem === referenceSystems.LV03.code &&
      completeLV03 &&
      hasChangedLV03
    ) {
      transformCoodinates("LV03", coordinates.LV03.X, coordinates.LV03.Y).then(
        res => {
          setValuesForReferenceSystem("LV95", res.easting, res.northing);
          console.log("update lv 03");

          updateCoordinates(
            res.easting,
            res.northing,
            coordinates.LV03.X,
            coordinates.LV03.Y,
          );
        },
      );
    }
  }, [
    borehole,
    coordinates,
    setValuesForReferenceSystem,
    transformCoodinates,
    updateCoordinates,
    referenceSystem,
  ]);

  return (
    <Segment>
      <Form size={size}>
        <Form.Group widths="equal">
          <Form.Field error={mentions.indexOf("srs") >= 0} required>
            <label>
              <TranslationText id="srs" />
            </label>
            <Controller
              name="srs"
              control={control}
              defaultValue={referenceSystems.LV95.code}
              render={({ field }) => (
                <FormControl
                  {...field}
                  style={{
                    height: "36px",
                    display: "flex",
                    justifyContent: "space-around",
                  }}>
                  <RadioGroup
                    row
                    value={referenceSystem ?? referenceSystems.LV95.code}
                    onChange={e => changeReferenceSystem(e.target.value)}>
                    <FormControlLabel
                      value={referenceSystems.LV95.code}
                      sx={{ flexGrow: 1 }}
                      control={
                        <Radio
                          sx={{
                            "&.Mui-checked": {
                              color: "black",
                            },
                          }}
                        />
                      }
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
                      control={
                        <Radio
                          sx={{
                            "&.Mui-checked": {
                              color: "black",
                            },
                          }}
                        />
                      }
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
          <Stack direction="row" spacing={2} justifyContent="space-around">
            <Stack direction="column" sx={{ flexGrow: 1 }}>
              <Controller
                name="location_x"
                control={control}
                rules={{
                  required: true,
                  min: coordinateLimits.LV95.X.Min,
                  max: coordinateLimits.LV95.X.Max,
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
                    <Input
                      type="number"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      step="0.0001"
                      readOnly={!isLV95}
                      onChange={e => {
                        changeCoordinate("LV95", "X", e.target.value);
                      }}
                      spellCheck="false"
                      value={field.value || ""}
                    />
                  </Form.Field>
                )}
              />
              <Controller
                name="location_y"
                control={control}
                rules={{
                  required: true,
                  min: coordinateLimits.LV95.Y.Min,
                  max: coordinateLimits.LV95.Y.Max,
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
                    <Input
                      type="number"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      step="0.0001"
                      readOnly={!isLV95}
                      onChange={e => {
                        // new columns!!
                        changeCoordinate("LV95", "Y", e.target.value);
                      }}
                      spellCheck="false"
                      value={field.value || ""}
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
                  min: coordinateLimits.LV03.X.Min,
                  max: coordinateLimits.LV03.X.Max,
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
                    <Input
                      type="number"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      step="0.0001"
                      readOnly={isLV95}
                      onChange={e => {
                        // new columns!!
                        changeCoordinate("LV03", "X", e.target.value);
                      }}
                      spellCheck="false"
                      value={field.value || ""}
                    />
                  </Form.Field>
                )}
              />
              <Controller
                name="location_y_lv03"
                control={control}
                rules={{
                  required: true,
                  min: coordinateLimits.LV03.Y.Min,
                  max: coordinateLimits.LV03.Y.Max,
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
                    <Input
                      type="number"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      step="0.0001"
                      readOnly={isLV95}
                      onChange={e => {
                        // new columns!!
                        changeCoordinate("LV03", "Y", e.target.value);
                      }}
                      spellCheck="false"
                      value={field.value || ""}
                    />
                  </Form.Field>
                )}
              />
            </Stack>
          </Stack>
        </Box>
        <Form.Group widths="equal">
          <Form.Field error={mentions.indexOf("qt_location") >= 0} required>
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
          <Form.Field
            error={
              mentions.indexOf("elevation_z") >= 0 ||
              borehole.data.elevation_z == null
            }
            required>
            <label>
              <TranslationText id="elevation_z" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "elevation_z",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={borehole.data.elevation_z ?? ""}
            />
          </Form.Field>

          <Form.Field error={mentions.indexOf("qt_elevation") >= 0} required>
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
            error={
              mentions.indexOf("reference_elevation") >= 0 ||
              borehole.data.reference_elevation == null
            }
            required>
            <label>
              <TranslationText id="reference_elevation" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "reference_elevation",
                  e.target.value === "" ? null : e.target.value,
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
            />
          </Form.Field>
          <Form.Field
            error={mentions.indexOf("qt_reference_elevation") >= 0}
            required>
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
            error={
              mentions.indexOf("reference_elevation_type") >= 0 ||
              borehole.data.reference_elevation_type === null
            }
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
          <Form.Field error={mentions.indexOf("hrs") >= 0} required>
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

export default LocationSegment;
