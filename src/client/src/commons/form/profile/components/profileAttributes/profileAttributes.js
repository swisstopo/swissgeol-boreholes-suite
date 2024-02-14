import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import * as Styled from "./styles";
import { Checkbox } from "semantic-ui-react";
import TranslationText from "../../../translationText";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import ProfileAttributeList from "./components/profileAttributeList/profileAttributeList";
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { AlertContext } from "../../../../../components/alert/alertContext";
import {
  fetchLayerById,
  layerQueryKey,
  updateLayer,
} from "../../../../../api/fetchApiV2";

const ProfileAttributes = props => {
  const {
    id,
    isEditable,
    onUpdated,
    attribute,
    reloadAttribute,
    selectedStratigraphyID,
  } = props.data;

  const { codes, geocode } = useSelector(state => ({
    codes: state.core_domain_list,
    geocode: "Geol",
  }));
  const [showAll, setShowAll] = useState(false);
  const [state, setState] = useState({
    isPatching: false,
    layer: {
      id: id?.hasOwnProperty("id") ? id : null,
      kind: null,
      depth_from: null,
      depth_to: null,
      last: null,
      qt_description: null,
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
  const alertContext = useContext(AlertContext);

  const mounted = useRef(false);

  const mapCodelistToAttribute = (codelists, schema) => {
    return codelists.filter(x => x.schema === schema).map(x => x.id);
  };

  const mapResponseToLayer = useCallback(response => {
    if (response?.codelists?.length > 0) {
      response["uscs_3"] = mapCodelistToAttribute(
        response.codelists,
        "uscs_type",
      );
      response["grain_shape"] = mapCodelistToAttribute(
        response.codelists,
        "mlpr110",
      );
      response["grain_granularity"] = mapCodelistToAttribute(
        response.codelists,
        "mlpr115",
      );
      response["organic_component"] = mapCodelistToAttribute(
        response.codelists,
        "mlpr108",
      );
      response["debris"] = mapCodelistToAttribute(response.codelists, "debris");
      response["color"] = mapCodelistToAttribute(response.codelists, "mlpr112");
    }
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

  const updateChange = (attribute, value, to = true, isNumber = false) => {
    if (!isEditable) {
      alertContext.error(t("common:errorStartEditing"));
      return;
    }

    setState(prevState => ({ ...prevState, isPatching: true }));
    _.set(state.layer, attribute, value);

    if (isNumber && /^-?\d*[.,]?\d*$/.test(value)) {
      value = _.toNumber(value);
    }
    var updatedLayer = {
      ...state.layer,
      [attribute]: value,
    };

    var codelistIds = [];
    if (updatedLayer["uscs_3"]) {
      codelistIds = codelistIds.concat(updatedLayer["uscs_3"]);
    }
    if (updatedLayer["grain_shape"]) {
      codelistIds = codelistIds.concat(updatedLayer["grain_shape"]);
    }
    if (updatedLayer["grain_granularity"]) {
      codelistIds = codelistIds.concat(updatedLayer["grain_granularity"]);
    }
    if (updatedLayer["organic_component"]) {
      codelistIds = codelistIds.concat(updatedLayer["organic_component"]);
    }
    if (updatedLayer["debris"]) {
      codelistIds = codelistIds.concat(updatedLayer["debris"]);
    }
    if (updatedLayer["color"]) {
      codelistIds = codelistIds.concat(updatedLayer["color"]);
    }
    updatedLayer["codelistIds"] = codelistIds;

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
          if (
            _.isObject(element.conf) &&
            _.has(element.conf, `fields.${field}`)
          ) {
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
        <Styled.CheckboxContainer>
          <TranslationText id="showallfields" />
          <Checkbox
            checked={showAll}
            onChange={() => setShowAll(!showAll)}
            toggle
          />
        </Styled.CheckboxContainer>
      )}

      {attribute && (
        <ProfileAttributeList
          data={{
            attribute,
            showAll,
            updateChange,
            layer: state.layer,
            isVisibleFunction,
          }}
        />
      )}
    </Styled.Container>
  );
};

export default ProfileAttributes;
