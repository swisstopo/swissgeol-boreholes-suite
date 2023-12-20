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
import { sendAttribute } from "./api";
import ProfileAttributeList from "./components/profileAttributeList/profileAttributeList";
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { AlertContext } from "../../../../alert/alertContext";
import { fetchLayerById, layerQueryKey } from "../../../../../api/fetchApiV2";

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
    isFetching: false,
    isPatching: false,
    updateAttributeDelay: {},
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
      fill_material: null,
      casing_id: null,
      casing_kind: null,
      casing_material: null,
      casing_date_spud: null,
      casing_date_finish: null,
      casing_innder_diameter: null,
      casing_outer_diameter: null,
      fill_kind: null,
    },
  });
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const alertContext = useContext(AlertContext);

  const mounted = useRef(false);

  const mapCodelistToAttribute = (codelists, schema) => {
    return codelists.filter(x => x.schema === schema).map(x => x.id);
  };

  const load = useCallback(id => {
    fetchLayerById(id).then(data => {
      if (mounted.current) {
        data["depth_from"] = data["fromDepth"];
        data["depth_to"] = data["toDepth"];
        data["last"] = data["isLast"];
        data["qt_description"] = data["qtDescriptionId"];
        data["lithology"] = data["lithologyId"];
        data["original_lithology"] = data["originalLithology"];
        data["uscs_original"] = data["originalUscs"];
        data["uscs_determination"] = data["uscsDeterminationId"];
        data["uscs_1"] = data["uscs1Id"];
        data["grain_size_1"] = data["grainSize1Id"];
        data["uscs_2"] = data["uscs2Id"];
        data["grain_size_2"] = data["grainSize2Id"];
        data["layer_lithology_top_bedrock"] = data["lithologyTopBedrockId"];
        data["striae"] = data["isStriae"];
        data["consistance"] = data["consistenceId"];
        data["plasticity"] = data["plasticityId"];
        data["compactness"] = data["compactnessId"];
        data["cohension"] = data["cohensionId"];
        data["gradation"] = data["gradationId"];
        data["humidity"] = data["humidityId"];
        data["alteration"] = data["alterationId"];
        data["casing_id"] = data["casing"];
        data["casing_kind"] = data["casingKindId"];
        data["casing_material"] = data["casingMaterialId"];
        data["casing_date_spud"] = data["casingDateSpud"];
        data["casing_date_finish"] = data["casingDateFinish"];
        data["casing_innder_diameter"] = data["casingInnerDiameter"];
        data["casing_outer_diameter"] = data["casingOuterDiameter"];
        data["fill_kind"] = data["fillKindId"];
        data["fill_material"] = data["fillMaterialId"];

        if (data?.codelists?.length > 0) {
          data["uscs_3"] = mapCodelistToAttribute(data.codelists, "mcla101");
          data["grain_shape"] = mapCodelistToAttribute(
            data.codelists,
            "mlpr110",
          );
          data["grain_granularity"] = mapCodelistToAttribute(
            data.codelists,
            "mlpr115",
          );
          data["organic_component"] = mapCodelistToAttribute(
            data.codelists,
            "mlpr108",
          );
          data["debris"] = mapCodelistToAttribute(data.codelists, "mcla107");
          data["color"] = mapCodelistToAttribute(data.codelists, "mlpr112");
        }

        setState({
          isFetching: false,
          layer: data,
        });
        console.log(state.layer.id);
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (id && mounted.current) {
      load(id);
      setShowAll(false);
    } else if (id === null) {
      setState({ state: null });
    }
    return () => {
      mounted.current = false;
    };
  }, [id, reloadAttribute, load]);

  const updateChange = (attribute, value, to = true, isNumber = false) => {
    if (!isEditable) {
      alertContext.error(t("common:errorStartEditing"));
      return;
    }

    setState(prevState => ({ ...prevState, isPatching: true }));
    _.set(state.layer, attribute, value);

    if (isNumber) {
      if (value === null) {
        patch(attribute, value);
      } else if (/^-?\d*[.,]?\d*$/.test(value)) {
        patch(attribute, _.toNumber(value));
      }
    } else {
      patch(attribute, value);
    }
  };

  const patch = (attribute, value) => {
    clearTimeout(state.updateAttributeDelay?.[attribute]);

    let setDelay = setTimeout(() => {
      sendAttribute(state?.layer?.id, attribute, value).then(response => {
        if (response) {
          onUpdated(attribute);
          queryClient.invalidateQueries({
            queryKey: [layerQueryKey, selectedStratigraphyID],
          });
        }
      });
    }, 500);

    Promise.resolve().then(() => {
      setState(prevState => ({
        ...prevState,
        isPatching: false,
        updateAttributeDelay: { [attribute]: setDelay },
      }));
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
