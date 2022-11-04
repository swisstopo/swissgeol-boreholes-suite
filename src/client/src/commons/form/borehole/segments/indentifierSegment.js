import React from "react";
import _ from "lodash";

import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DomainText from "../../domain/domainText";
import TranslationText from "../../translationText";

import { Form, Icon, Input, Segment } from "semantic-ui-react";
import { removeIdentifier, addIdentifier } from "../../../../api-lib";

const IdentifierSegment = props => {
  const { borehole, identifier, identifierValue, updateBorehole, setState } =
    props;
  return (
    <Segment>
      <div
        className="flex_row bdms_bold"
        style={{
          borderBottom: "thin solid #d2d2d2",
          paddingBottom: "0.4em",
        }}>
        <div className="flex_fill">
          <TranslationText id="borehole_identifier" />
        </div>
        <div className="flex_fill">
          <TranslationText id="borehole_identifier_value" />
        </div>
        <div>
          {borehole.data.lock !== null ? <TranslationText id="delete" /> : null}
        </div>
      </div>
      {borehole.data.custom.identifiers
        ? borehole.data.custom.identifiers.map((identifier, idx) => (
            <div
              className="flex_row"
              key={"bhfbi-" + idx}
              data-cy="identifier"
              style={{
                paddingTop: "0.5em",
              }}>
              <div className="flex_fill">
                <DomainText id={identifier.id} schema="borehole_identifier" />
              </div>
              <div className="flex_fill">{identifier.value}</div>
              <div>
                {borehole.data.lock !== null ? (
                  <div
                    className="linker"
                    onClick={() => {
                      removeIdentifier(borehole.data.id, identifier.id).then(
                        response => {
                          if (response.data.success) {
                            const tmp = _.cloneDeep(borehole.data);
                            if (tmp.custom.identifiers.length === 1) {
                              tmp.custom.identifiers = [];
                            } else {
                              tmp.custom.identifiers =
                                tmp.custom.identifiers.filter(
                                  el => el.id !== identifier.id,
                                );
                            }
                            updateBorehole(tmp);
                          }
                        },
                      );
                    }}>
                    <TranslationText id="delete" />
                  </div>
                ) : null}
              </div>
            </div>
          ))
        : null}
      {borehole.data.lock !== null ? (
        <Form autoComplete="off" size="tiny">
          <Form.Group widths="equal">
            <Form.Field
              data-cy="identifier-dropdown"
              error={
                identifier === null &&
                (borehole.data?.custom?.identifiers === null ||
                  borehole.data.custom.identifiers.length === 0)
              }>
              <label>&nbsp;</label>
              <DomainDropdown
                onSelected={selected => {
                  setState({
                    identifier: selected.id,
                  });
                }}
                schema="borehole_identifier"
                selected={identifier}
              />
            </Form.Field>
            <Form.Field
              data-cy="identifier-value"
              error={
                identifierValue === "" &&
                (borehole.data?.custom?.identifiers === null ||
                  borehole.data.custom.identifiers.length === 0)
              }>
              <label>&nbsp;</label>
              <Input
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                onChange={e => {
                  setState({
                    identifierValue: e.target.value,
                  });
                }}
                spellCheck="false"
                value={identifierValue ?? ""}
              />
            </Form.Field>
            <div
              style={{
                flex: "0 0 0% !important",
              }}>
              <Form.Button
                data-cy="identifier-add"
                disabled={identifier === null || identifierValue === ""}
                icon
                label="&nbsp;"
                onClick={() => {
                  // Check duplicate
                  const alreadySet = borehole.data.custom.identifiers
                    ? borehole.data.custom.identifiers.map(el => el.id)
                    : [];

                  if (alreadySet.includes(identifier)) {
                    // alert(t("msgIdentifierAlreadyUsed"));
                  } else {
                    addIdentifier(
                      borehole.data.id,
                      identifier,
                      identifierValue,
                    ).then(response => {
                      if (response.data.success) {
                        setState(
                          {
                            identifier: null,
                            identifierValue: "",
                          },
                          () => {
                            const tmp = _.cloneDeep(borehole.data);
                            if (tmp.custom.identifiers === null) {
                              tmp.custom.identifiers = [];
                            }
                            tmp.custom.identifiers.push(response.data.data);
                            updateBorehole(tmp);
                          },
                        );
                      }
                    });
                  }
                }}
                secondary
                size="tiny">
                <Icon name="plus" />
              </Form.Button>
            </div>
          </Form.Group>
        </Form>
      ) : null}
    </Segment>
  );
};

export default IdentifierSegment;
