import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import _ from "lodash";
import { fetchStratigraphy } from "../../../../../../../api/fetchApiV2.ts";
import { FormContainer } from "../../../../../../../components/form/form.ts";
import { updateStratigraphyAttribute } from "../api/index.js";
import InfoList from "./InfoList.jsx";

const LithologyInfo = props => {
  const { selectedStratigraphyID: id, onUpdated, attribute, checkLock } = props.data;
  const mounted = useRef(false);
  const [state, setState] = useState({
    isPatching: false,
    updateAttributeDelay: {},
    profileInfo: {
      id: null,
      name: null,
      isPrimary: false,
      date: null,
      date_abd: null,
      notes: null,
      quality: null,
    },
  });
  const setData = useCallback(id => {
    fetchStratigraphy(id).then(data => {
      if (mounted.current) setState({ profileInfo: data });
    });
  }, []);

  useEffect(() => {
    //using useRef for memory leak error
    mounted.current = true;
    if (id && mounted.current) setData(id);
    else setState({});

    return () => {
      mounted.current = false;
    };
  }, [id, setData]);

  const updateChange = (attribute, value, isNumber = false) => {
    if (!checkLock()) return;
    setState(prevState => ({ ...prevState, isPatching: true }));
    _.set(state.profileInfo, attribute, value);

    if (isNumber && value !== null) {
      if (/^-?\d*[.,]?\d*$/.test(value)) {
        patch(attribute, _.toNumber(value));
      }
    } else {
      patch(attribute, value);
    }
  };

  const patch = (attribute, value) => {
    clearTimeout(state.updateAttributeDelay?.[attribute]);

    let setDelay = setTimeout(() => {
      updateStratigraphyAttribute(id, attribute, value).then(res => {
        if (res) {
          setState(prevState => ({ ...prevState, isPatching: false }));
          if (_.isFunction(onUpdated)) {
            onUpdated(attribute);
          }
        }
      });
    }, 500);

    Promise.resolve().then(() => {
      setState(prevState => ({
        ...prevState,
        updateAttributeDelay: { [attribute]: setDelay },
      }));
    });
  };
  return (
    <FormContainer>
      <Box sx={{ border: "1px solid lightgrey", borderRadius: 1, p: 2 }}>
        {attribute && <InfoList id={id} onUpdated={onUpdated} profileInfo={state.profileInfo} />}
      </Box>
    </FormContainer>
  );
};

export default LithologyInfo;
