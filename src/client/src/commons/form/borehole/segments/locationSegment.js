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
import { produce } from "immer";
import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DomainText from "../../domain/domainText";
import TranslationText from "../../translationText";
import { Form, Input, Segment } from "semantic-ui-react";

const LocationSegment = props => {
  const { control, reset, trigger, setValue, getValues } = useForm({
    mode: "onChange",
  });
  const { size, mentions, borehole, updateChange, updateNumber, checkLock } =
    props;
  const [referenceSystem, setReferenceSystem] = useState(borehole.data.srs);

  const [coordinates, setCoordinates] = useState({
    LV95: { X: null, Y: null },
    LV03: { X: null, Y: null },
  });

  const webApilv95tolv03 = "http://geodesy.geo.admin.ch/reframe/lv95tolv03";
  const webApilv03tolv95 = "http://geodesy.geo.admin.ch/reframe/lv03tolv95";

  const referenceSystems = {
    LV95: 20104001,
    LV03: 20104002,
  };

  const isLV95 =
    referenceSystem === referenceSystems.LV95 || referenceSystem == null; // LV95 should be selected by default.

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

  const transformCoodinates = useCallback(async (referenceSystem, x, y) => {
    let apiUrl;
    if (referenceSystem === "LV95") {
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
    setCoordinates({ LV95: { X: null, Y: null }, LV03: { X: null, Y: null } });
    setReferenceSystem(parseInt(value));
  };

  const setValuesForReferenceSystem = useCallback(
    (referenceSystem, X, Y) => {
      setValue(referenceSystem + "X", X, {
        shouldValidate: true,
      });
      setValue(referenceSystem + "Y", Y, {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const changeCoordinate = (referenceSystem, direction, value) => {
    if (checkLock() === false) {
      return;
    }

    const alternativeReferenceSystem =
      referenceSystem === "LV95" ? "LV03" : "LV95";
    const isXCoodrdinate = direction === "X";

    if (
      coordinateLimits[referenceSystem][direction].Min < value &&
      value < coordinateLimits[referenceSystem][direction].Max
    ) {
      setCoordinates({
        LV95: { X: getValues("LV95X"), Y: getValues("LV95Y") },
        LV03: { X: getValues("LV03X"), Y: getValues("LV03Y") },
      });

      // set values to alternative reference system if both X and Y coordinates exist.
      if (
        (isXCoodrdinate && coordinates[referenceSystem].Y) ||
        (!isXCoodrdinate && coordinates[referenceSystem].X)
      ) {
        transformCoodinates(
          referenceSystem,
          isXCoodrdinate ? value : coordinates[referenceSystem].X,
          isXCoodrdinate ? coordinates[referenceSystem].Y : value,
        ).then(res => {
          setValuesForReferenceSystem(
            alternativeReferenceSystem,
            res.easting,
            res.northing,
          );

          // update backend
          updateNumber("location_x", getValues("LV95X"));
          updateNumber("location_y", getValues("LV95Y"));
          updateNumber("location_x_lv03", getValues("LV03X"));
          updateNumber("location_y_lv03", getValues("LV03Y"));
        });
      }
    } else {
      // reset values if they do not meet validation criteria.
      setCoordinates(
        produce(coordinates, draft => {
          draft[referenceSystem][direction] = null;
        }),
      );
      setValuesForReferenceSystem(alternativeReferenceSystem, "", "");
    }
  };

  //initially validate form to display errors
  useEffect(() => {
    trigger();
  }, [trigger, referenceSystem]);

  // set new values if borehole changes.
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
    // calculate on client if values are not in database
    if (!borehole.data.location_x_lv03 || !borehole.data.location_y_lv03) {
      transformCoodinates(
        "LV95",
        borehole.data.location_x,
        borehole.data.location_y,
      ).then(res => {
        res && setValuesForReferenceSystem("LV03", res.easting, res.northing);
      });
    }
  }, [borehole, setValuesForReferenceSystem, transformCoodinates]);

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
              defaultValue={referenceSystems.LV95}
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
                    value={referenceSystem ?? referenceSystems.LV95}
                    onChange={e => changeReferenceSystem(e.target.value)}>
                    <FormControlLabel
                      value={referenceSystems.LV95}
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
                        <DomainText id={referenceSystems.LV95} schema="srs" />
                      }
                    />
                    <FormControlLabel
                      value={referenceSystems.LV03}
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
                        <DomainText id={referenceSystems.LV03} schema="srs" />
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
                name="LV95X"
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
                      readOnly={!isLV95}
                      onChange={e => {
                        // new columns!!
                        changeCoordinate("LV95", "X", e.target.value);
                      }}
                      spellCheck="false"
                      value={field.value || ""}
                    />
                  </Form.Field>
                )}
              />
              <Controller
                name="LV95Y"
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
                name="LV03X"
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
                name="LV03Y"
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
