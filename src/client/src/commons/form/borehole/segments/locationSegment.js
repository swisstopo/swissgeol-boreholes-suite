import React from "react";
import _ from "lodash";

import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DomainText from "../../domain/domainText";
import TranslationText from "../../translationText";

import { Form, Input, Segment } from "semantic-ui-react";

const LocationSegment = props => {
  const { size, mentions, borehole, updateChange, updateNumber } = props;
  return (
    <Segment>
      <Form size={size}>
        <Form.Group widths="equal">
          <Form.Field error={mentions.indexOf("srs") >= 0} required>
            <label>
              <TranslationText id="srs" />
            </label>
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
              }}>
              <div>
                <DomainText id={borehole.data.srs} schema="srs" />
              </div>
            </div>
          </Form.Field>
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
              mentions.indexOf("location_x") >= 0 ||
              borehole.data.location_x < 2485869.5728 ||
              borehole.data.location_x > 2837076.5648
            }
            required>
            <label>
              <TranslationText id="location_x" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              disabled={borehole.data.srs === null}
              onChange={e => {
                updateNumber(
                  "location_x",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.location_x)
                  ? ""
                  : borehole.data.location_x
              }
            />
          </Form.Field>
          <Form.Field
            error={
              mentions.indexOf("location_y") >= 0 ||
              borehole.data.location_y < 1076443.1884 ||
              borehole.data.location_y > 1299941.7864
            }
            required>
            <label>
              <TranslationText id="location_y" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              disabled={borehole.data.srs === null}
              onChange={e => {
                updateNumber(
                  "location_y",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.location_y)
                  ? ""
                  : borehole.data.location_y
              }
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            error={
              mentions.indexOf("elevation_z") >= 0 ||
              _.isNil(borehole.data.elevation_z)
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
              value={
                _.isNil(borehole.data.elevation_z)
                  ? ""
                  : "" + borehole.data.elevation_z
              }
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
              _.isNil(borehole.data.reference_elevation)
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
                    e.target.value === "" ? null : _.toNumber(e.target.value),
                  );
                }
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.reference_elevation)
                  ? ""
                  : "" + borehole.data.reference_elevation
              }
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
