import React from "react";
import TranslationText from "../../translationText";
import { Form, Segment } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

import DomainDropdown from "../../domain/dropdown/domainDropdown";

import DateField from "../../dateField";

const RestrictionSegment = props => {
  const { size, borehole, updateChange } = props;
  return (
    <Segment>
      <Form size={size}>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.restriction === null} required>
            <label>
              <TranslationText id="restriction" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("restriction", selected.id, false);
              }}
              schema="restriction"
              selected={borehole.data.restriction}
            />
          </Form.Field>
          <Form.Field
            error={
              (borehole.data.restriction === 20111003 &&
                !moment(borehole.data.restriction_until).isValid()) ||
              (borehole.data.restriction !== 20111003 &&
                _.isString(borehole.data.restriction_until) &&
                borehole.data.restriction_until !== "" &&
                moment(borehole.data.restriction_until).isValid())
            }
            required={borehole.data.restriction === 20111003}>
            <label>
              <TranslationText id="restriction_until" />
            </label>
            <DateField
              date={borehole.data.restriction_until}
              onChange={selected => {
                updateChange("restriction_until", selected, false);
              }}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default RestrictionSegment;
