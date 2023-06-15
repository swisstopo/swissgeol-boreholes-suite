import React from "react";
import TranslationText from "../../translationText";
import { Form, Segment } from "semantic-ui-react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

import _ from "lodash";
import moment from "moment";

import DomainDropdown from "../../domain/dropdown/domainDropdown";

import DateField from "../../dateField";

const RestrictionSegment = props => {
  const { size, borehole, updateChange } = props;

  const changeNationalInterest = value => {
    updateChange(
      "national_interest",
      value === "true" ? true : value === "false" ? false : null,
    );
  };

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
        <Form.Group widths="equal">
          <Form.Field>
            <label>
              <TranslationText id="national_interest" />
            </label>
            <FormControl
              style={{
                height: "36px",
                display: "flex",
                justifyContent: "space-around",
              }}>
              <RadioGroup
                row
                value={borehole.data.national_interest}
                onChange={e => changeNationalInterest(e.target.value)}>
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label={<TranslationText id={"yes"} />}
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label={<TranslationText id={"no"} />}
                />
                <FormControlLabel
                  value={null}
                  control={<Radio />}
                  label={<TranslationText id={"np"} />}
                />
              </RadioGroup>
            </FormControl>
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default RestrictionSegment;
