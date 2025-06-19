import { useCallback, useContext, useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { fetchStratigraphyByBoreholeId } from "../../../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../../../components/buttons/buttons";
import { useRequiredParams } from "../../../../../../hooks/useRequiredParams.js";
import { EditStateContext } from "../../../../editStateContext.tsx";
import { createNewStratigraphy } from "./api";
import ProfileHeaderList from "./profileHeaderList";

const ProfileHeader = props => {
  const { editingEnabled } = useContext(EditStateContext);
  const { id: boreholeId } = useRequiredParams();
  const { reloadHeader, selectedStratigraphy, setSelectedStratigraphy, setIsLoadingData } = props;
  const [profiles, setProfiles] = useState([]);

  const setStratigraphy = useCallback(
    item => {
      setSelectedStratigraphy(item);
    },
    [setSelectedStratigraphy],
  );

  const setSpecialData = useCallback(
    data => {
      if (!selectedStratigraphy) {
        setStratigraphy(data?.[0]);
      }
    },
    [selectedStratigraphy, setStratigraphy],
  );

  const setData = useCallback(
    id => {
      setIsLoadingData(true);
      fetchStratigraphyByBoreholeId(id).then(data => {
        setProfiles(data);
        setSpecialData(data);
        setIsLoadingData(false);
      });
    },
    [setSpecialData, setIsLoadingData],
  );

  useEffect(() => {
    if (boreholeId) {
      setData(boreholeId);
    }
  }, [boreholeId, reloadHeader, setData]);

  const createStratigraphy = () => {
    createNewStratigraphy(boreholeId).then(data => {
      if (data) setData(boreholeId);
    });
  };

  return (
    <Stack direction="row">
      <ProfileHeaderList
        profiles={profiles}
        selectedStratigraphy={selectedStratigraphy}
        setSelectedStratigraphy={setStratigraphy}
      />
      {editingEnabled && (
        <Box sx={{ marginLeft: "auto" }}>
          <AddButton label={"addStratigraphy"} onClick={createStratigraphy} />
        </Box>
      )}
    </Stack>
  );
};

export default ProfileHeader;
