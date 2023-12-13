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
import { fetchLayerById, updateLayer } from "../../../../../api/fetchApiV2";
import ProfileAttributeList from "./components/profileAttributeList/profileAttributeList";
import { useSelector } from "react-redux";
import { AlertContext } from "../../../../alert/alertContext";

const ProfileAttributes = props => {
  const { id, isEditable, attribute, reloadAttribute } = props.data;

  const { codes, geocode } = useSelector(state => ({
    codes: state.core_domain_list,
    geocode: "Geol",
  }));
  const [showAll, setShowAll] = useState(false);
  const [layer, setLayer] = useState([]);

  const { t } = useTranslation();
  const alertContext = useContext(AlertContext);

  const mounted = useRef(false);

  const mapCodelistToAttribute = (codelists, schema) => {
    return codelists.filter(x => x.schema === schema).map(x => x.id);
  };

  const mapResponseToLayer = useCallback(response => {
    if (response?.codelists?.length > 0) {
      response["uscs_3"] = mapCodelistToAttribute(
        response.codelists,
        "mcla101",
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
      response["debris"] = mapCodelistToAttribute(
        response.codelists,
        "mcla107",
      );
      response["color"] = mapCodelistToAttribute(response.codelists, "mlpr112");
    }
    setLayer(response);
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (id && mounted.current) {
      fetchLayerById(id).then(mapResponseToLayer);
      setShowAll(false);
    } else if (id === null) {
      setLayer([]);
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

    if (isNumber && /^-?\d*[.,]?\d*$/.test(value)) {
      value = _.toNumber(value);
    }
    var updatedLayer = {
      ...layer,
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

    updateLayer(updatedLayer).then(mapResponseToLayer);
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
            layer: layer,
            isVisibleFunction,
          }}
        />
      )}
    </Styled.Container>
  );
};

export default ProfileAttributes;
