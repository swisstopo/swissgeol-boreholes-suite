import TranslationText from "../../translationText.jsx";
import { Form, Segment } from "semantic-ui-react";
import { FormControl, RadioGroup, FormControlLabel } from "@mui/material";
import { DisabledRadio } from "./styledComponents.jsx";

import _ from "lodash";
import moment from "moment";

import DomainDropdown from "../../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";

import DateField from "../../dateField.jsx";

const RestrictionSegment = props => {
  const { size, borehole, updateChange, user } = props;

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

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
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field
            error={
              (borehole.data.restriction === 20111003 && !moment(borehole.data.restriction_until).isValid()) ||
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
              isEditable={isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="national_interest" />
            </label>
            <FormControl className="radio-group">
              <RadioGroup
                row
                value={
                  borehole.data.national_interest === true
                    ? "TRUE"
                    : borehole.data.national_interest === false
                      ? "FALSE"
                      : "NULL"
                }
                onChange={e => {
                  let value = e.target.value === "TRUE" ? true : e.target.value === "FALSE" ? false : null;
                  updateChange("national_interest", value, false);
                }}>
                <FormControlLabel
                  value="TRUE"
                  control={<DisabledRadio isEditable={!isEditable} />}
                  label={<TranslationText id={"yes"} />}
                />
                <FormControlLabel
                  value="FALSE"
                  control={<DisabledRadio isEditable={!isEditable} />}
                  label={<TranslationText id={"no"} />}
                />
                <FormControlLabel
                  value="NULL"
                  control={<DisabledRadio isEditable={!isEditable} />}
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
