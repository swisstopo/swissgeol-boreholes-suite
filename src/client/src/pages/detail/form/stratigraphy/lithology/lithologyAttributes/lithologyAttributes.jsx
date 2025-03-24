import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { FormControlLabel, Switch } from "@mui/material";
import _ from "lodash";
import { fetchLayerById, layerQueryKey, updateLayer } from "../../../../../../api/fetchApiV2.js";
import LithologyAttributeList from "./lithologyAttributeList/lithologyAttributeList.jsx";
import * as Styled from "./styles.js";

const LithologyAttributes = props => {
  const { id, isEditable, checkLock, onUpdated, attribute, reloadAttribute, selectedStratigraphyID } = props.data;

  const { codes, geocode } = useSelector(state => ({
    codes: state.core_domain_list,
    geocode: "Geol",
  }));
  const [showAll, setShowAll] = useState(false);
  const [state, setState] = useState({
    isPatching: false,
    layer: {
      // eslint-disable-next-line no-prototype-builtins
      id: id?.hasOwnProperty("id") ? id : null,
      kind: null,
      depth_from: null,
      depth_to: null,
      last: null,
      description_quality: null,
      lithology: null,
      color: [],
      plasticity: null,
      humidity: null,
      consistance: null,
      alteration: null,
      compactness: null,
      jointing: [],
      organic_component: [],
      striae: null,
      grain_size_1: null,
      grain_size_2: null,
      grain_shape: [],
      grain_granularity: [],
      cohesion: null,
      uscs_1: null,
      uscs_2: null,
      uscs_3: [],
      uscs_original: "",
      original_lithology: "",
      uscs_determination: [],
      debris: [],
      layer_lithology_top_bedrock: [],
      gradation: null,
      notes: "",
    },
  });
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mounted = useRef(false);

  const mapResponseToLayer = useCallback(response => {
    response["uscs_3"] = response.uscs3Codelists.map(x => x.id);
    response["grain_shape"] = response.grainShapeCodelists.map(x => x.id);
    response["grain_granularity"] = response.grainAngularityCodelists.map(x => x.id);
    response["organic_component"] = response.organicComponentCodelists.map(x => x.id);
    response["debris"] = response.debrisCodelists.map(x => x.id);
    response["color"] = response.colorCodelists.map(x => x.id);
    setState({
      isPatching: false,
      layer: response,
    });
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (id && mounted.current) {
      fetchLayerById(id).then(mapResponseToLayer);
      setShowAll(false);
    } else if (id === null) {
      setState({ state: null });
    }
    return () => {
      mounted.current = false;
    };
  }, [id, reloadAttribute, mapResponseToLayer]);

  const updateChange = (attribute, value, isNumber = false) => {
    if (!checkLock()) return;
    setState(prevState => ({ ...prevState, isPatching: true }));
    _.set(state.layer, attribute, value);

    if (isNumber && /^-?\d*[.,]?\d*$/.test(value)) {
      value = _.toNumber(value);
    }
    var updatedLayer = {
      ...state.layer,
      [attribute]: value,
    };

    updatedLayer.colorCodelistIds = updatedLayer.color;
    updatedLayer.debrisCodelistIds = updatedLayer.debris;
    updatedLayer.organicComponentCodelistIds = updatedLayer.organic_component;
    updatedLayer.grainAngularityCodelistIds = updatedLayer.grain_granularity;
    updatedLayer.grainShapeCodelistIds = updatedLayer.grain_shape;
    updatedLayer.uscs3CodelistIds = updatedLayer.uscs_3;

    updateLayer(updatedLayer).then(response => {
      mapResponseToLayer(response);
      onUpdated(attribute);
      queryClient.invalidateQueries({
        queryKey: [layerQueryKey, selectedStratigraphyID],
      });
    });
  };

  const isVisibleFunction = field => {
    if (_.has(codes, "data.layer_kind") && _.isArray(codes.data.layer_kind)) {
      for (let idx = 0; idx < codes.data.layer_kind.length; idx++) {
        const element = codes.data.layer_kind[idx];
        if (element.code === geocode) {
          if (_.isObject(element.conf) && _.has(element.conf, `fields.${field}`)) {
            return element.conf.fields[field];
          } else {
            return false;
          }
        }
      }
    }
    return false;
  };

  const showCheckbox = () => {
    let isVisibleCounter = 0;

    for (let i = 0; i < attribute?.length; i++) {
      if (isVisibleFunction(attribute[i]?.isVisibleValue)) {
        isVisibleCounter++;
      } else if (attribute[i]?.isVisible) {
        isVisibleCounter++;
      }
    }

    if (isVisibleCounter === attribute?.length) {
      return false;
    } else return true;
  };
  return (
    <Styled.Container disable={!id}>
      {showCheckbox() && (
        <FormControlLabel
          control={<Switch color="secondary" checked={showAll} onChange={() => setShowAll(!showAll)} />}
          label={t("showallfields")}
        />
      )}
      {attribute && (
        <LithologyAttributeList
          data={{
            attribute,
            showAll,
            updateChange,
            layer: state.layer,
            isVisibleFunction,
            isEditable,
          }}
        />
      )}
    </Styled.Container>
  );
};

export default LithologyAttributes;
