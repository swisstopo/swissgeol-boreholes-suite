import React from "react";
import MunicipalityDropdown from "../../municipality/dropdown/municipalityDropdown";
import TranslationText from "../../translationText";

import { Form, Input, Segment, Icon } from "semantic-ui-react";

const CantonMunicipalitySegment = props => {
  const { size, borehole, cantons, municipalities, zoomToPolygon } = props;

  return (
    <Segment>
      <Form
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        size={size}
        spellCheck="false">
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="country" />
            </label>
            <Input value={"Switzerland"} />
          </Form.Field>
          <Form.Field required>
            <label>
              <TranslationText id="canton" />
              &nbsp;
              {borehole.data.custom.canton !== null ? (
                <span
                  className="link"
                  onClick={() => {
                    for (let index = 0; index < cantons.length; index++) {
                      const canton = cantons[index];
                      if (canton.id === borehole.data.custom.canton) {
                        zoomToPolygon(canton.geom.coordinates);
                        break;
                      }
                    }
                  }}>
                  <Icon name="map marker" />
                </span>
              ) : null}
            </label>
            <Input
              value={
                cantons.filter(e => e.id === borehole.data.custom.canton)?.[0]
                  ?.name ?? ""
              }
            />
          </Form.Field>
          <Form.Field required>
            <label>
              <TranslationText id="city" />
              &nbsp;
              {borehole.data.custom.city !== null ? (
                <span
                  className="link"
                  onClick={() => {
                    for (
                      let index = 0;
                      index < municipalities.length;
                      index++
                    ) {
                      const municipality = municipalities[index];
                      if (municipality.id === borehole.data.custom.city) {
                        zoomToPolygon(municipality.geom.coordinates);
                        break;
                      }
                    }
                  }}>
                  <Icon name="map marker" />
                </span>
              ) : null}
            </label>
            <div style={{ display: "none" }}>
              <MunicipalityDropdown
                canton={borehole.data.custom.canton}
                disabled={borehole.data.custom.canton === null}
                selected={borehole.data.custom.city}
              />
            </div>
            <Input
              value={
                municipalities
                  ?.filter(
                    municipality =>
                      borehole.data.custom.canton === municipality.cid,
                  )
                  ?.filter(e => e.id === borehole.data.custom.city)?.[0]
                  ?.name ?? ""
              }
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default CantonMunicipalitySegment;
