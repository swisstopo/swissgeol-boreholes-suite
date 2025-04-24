import { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { fetchStratigraphy } from "../../../../../../../api/fetchApiV2.ts";
import { FormContainer } from "../../../../../../../components/form/form.ts";
import InfoList from "./InfoList.jsx";

const LithologyInfo = props => {
  const { selectedStratigraphyID: id, onUpdated, attribute } = props.data;
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
      setState({ profileInfo: data });
    });
  }, []);

  useEffect(() => {
    if (id) setData(id);
    else setState({});
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
