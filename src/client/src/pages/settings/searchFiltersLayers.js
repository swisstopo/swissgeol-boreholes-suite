import React from 'react';

import { Checkbox, Segment } from 'semantic-ui-react';

import TranslationText from '../../commons/form/translationText';

function SearchFiltersLayers(props) {
  return (
    <Segment.Group>
      <Segment>
        <Checkbox
          checked={props.layer.depth}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.depth', d.checked);
          }}
        />
        <TranslationText id="layer_depth" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.depth_from}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.depth_from', d.checked);
          }}
        />
        <TranslationText id="layer_depth_from" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.depth_to}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.depth_to', d.checked);
          }}
        />
        <TranslationText id="layer_depth_to" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.description}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.description', d.checked);
          }}
        />
        <TranslationText id="description" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.geology}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.geology', d.checked);
          }}
        />
        <TranslationText id="layer_geology" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.lithology}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.lithology', d.checked);
          }}
        />
        <TranslationText id="layer_lithology" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.lithostratigraphy}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.lithostratigraphy', d.checked);
          }}
        />
        <TranslationText id="layer_lithostratigraphy" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.chronostratigraphy}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.chronostratigraphy', d.checked);
          }}
        />
        <TranslationText id="layer_chronostratigraphy" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.color}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.color', d.checked);
          }}
        />
        <TranslationText id="layer_color" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.plasticity}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.plasticity', d.checked);
          }}
        />
        <TranslationText id="layer_plasticity" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.humidity}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.humidity', d.checked);
          }}
        />
        <TranslationText id="layer_humidity" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.consistance}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.consistance', d.checked);
          }}
        />
        <TranslationText id="layer_consistance" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.alteration}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.alteration', d.checked);
          }}
        />
        <TranslationText id="layer_alteration" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.compactness}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.compactness', d.checked);
          }}
        />
        <TranslationText id="layer_compactness" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.organic_component}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.organic_component', d.checked);
          }}
        />
        <TranslationText id="layer_organic_component" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.striae}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.striae', d.checked);
          }}
        />
        <TranslationText id="layer_striae" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.grain_size_1}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.grain_size_1', d.checked);
          }}
        />
        <TranslationText id="layer_grain_size_1" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.grain_size_2}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.grain_size_2', d.checked);
          }}
        />
        <TranslationText id="layer_grain_size_2" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.grain_shape}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.grain_shape', d.checked);
          }}
        />
        <TranslationText id="layer_grain_shape" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.grain_granularity}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.grain_granularity', d.checked);
          }}
        />
        <TranslationText id="layer_grain_granularity" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.cohesion}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.cohesion', d.checked);
          }}
        />
        <TranslationText id="layer_cohesion" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.further_properties}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.further_properties', d.checked);
          }}
        />
        <TranslationText id="layer_further_properties" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.uscs_1}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.uscs_1', d.checked);
          }}
        />
        <TranslationText id="layer_uscs_1" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.uscs_3}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.uscs_3', d.checked);
          }}
        />
        <TranslationText id="layer_uscs_3" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.uscs_determination}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.uscs_determination', d.checked);
          }}
        />
        <TranslationText id="layer_uscs_determination" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.debris}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.debris', d.checked);
          }}
        />
        <TranslationText id="layer_debris" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.lithology_top_bedrock}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.lithology_top_bedrock', d.checked);
          }}
        />
        <TranslationText id="layer_lithology_top_bedrock" />
      </Segment>
      <Segment>
        <Checkbox
          checked={props.layer.lithology_top_bedrock}
          label=""
          onChange={(e, d) => {
            props.toggleFilter('layer.lithology_top_bedrock', d.checked);
          }}
        />
        <TranslationText id="layer_lithology_top_bedrock" />
      </Segment>
    </Segment.Group>
  );
}

export default SearchFiltersLayers;
