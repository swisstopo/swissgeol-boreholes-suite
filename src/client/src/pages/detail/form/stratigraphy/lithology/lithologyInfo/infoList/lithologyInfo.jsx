import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { fetchStratigraphy } from "../../../../../../../api/fetchApiV2.ts";
import { FormContainer } from "../../../../../../../components/form/form.ts";
import InfoList from "./InfoList.jsx";

const LithologyInfo = props => {
  const { selectedStratigraphyID: id, onUpdated, attribute } = props.data;
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

  return (
    <FormContainer>
      <Box sx={{ border: "1px solid lightgrey", borderRadius: 1, p: 2 }}>
        {attribute && <InfoList id={id} onUpdated={onUpdated} profileInfo={state.profileInfo} />}
      </Box>
    </FormContainer>
  );
};

export default LithologyInfo;
