import { useContext } from "react";
import _ from "lodash";

import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import DomainText from "../../../../components/legacyComponents/domain/domainText.jsx";
import { Form, Icon, Input, Segment } from "semantic-ui-react";
import { addIdentifier, removeIdentifier } from "../../../../api-lib";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";

const IdentifierSegment = props => {
  const { borehole, identifier, identifierValue, updateBorehole, setState, user } = props;
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <Segment>
      <div
        className="flex_row bdms_bold"
        style={{
          borderBottom: "thin solid #d2d2d2",
          paddingBottom: "0.4em",
        }}>
        <div className="flex_fill">{t("borehole_identifier")}</div>
        <div className="flex_fill">{t("borehole_identifier_value")}</div>
        <div>{borehole.data.lock !== null ? t("delete") : null}</div>
      </div>
      <div
        className="flex_row"
        data-cy="identifier-application"
        style={{
          paddingTop: "0.5em",
        }}>
        <div className="flex_fill">{t("borehole_technical_id")}</div>
        <div className="flex_fill">{borehole.data.id}</div>
        <div>
          {borehole.data.lock !== null ? (
            <div
              style={{
                visibility: "hidden",
              }}>
              {t("delete")}
            </div>
          ) : null}
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
                      removeIdentifier(borehole.data.id, identifier.id).then(response => {
                        if (response.data.success) {
                          const tmp = _.cloneDeep(borehole.data);
                          if (tmp.custom.identifiers.length === 1) {
                            tmp.custom.identifiers = [];
                          } else {
                            tmp.custom.identifiers = tmp.custom.identifiers.filter(el => el.id !== identifier.id);
                          }
                          updateBorehole(tmp);
                        }
                      });
                    }}>
                    {t("delete")}
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
                (borehole.data?.custom?.identifiers === null || borehole.data.custom.identifiers.length === 0)
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
                readOnly={!isEditable}
              />
            </Form.Field>
            <Form.Field
              data-cy="identifier-value"
              error={
                identifierValue === "" &&
                (borehole.data?.custom?.identifiers === null || borehole.data.custom.identifiers.length === 0)
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
                readOnly={!isEditable}
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
                    showAlert(t("msgIdentifierAlreadyUsed"), "error");
                  } else {
                    addIdentifier(borehole.data.id, identifier, identifierValue).then(response => {
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
