import { useCallback, useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { fetchStratigraphyByBoreholeId } from "../../../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../../../components/buttons/buttons";
import { createNewStratigraphy } from "./api";
import ProfileHeaderList from "./profileHeaderList";

const ProfileHeader = props => {
  const { boreholeID, isEditable, reloadHeader, selectedStratigraphy, setSelectedStratigraphy, setIsLoadingData } =
    props;
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
    if (boreholeID) {
      setData(boreholeID);
    }
  }, [boreholeID, reloadHeader, setData]);

  const createStratigraphy = () => {
    createNewStratigraphy(boreholeID).then(data => {
      if (data) setData(boreholeID);
    });
  };

  return (
    <Stack direction="row">
      <ProfileHeaderList
        profiles={profiles}
        selectedStratigraphy={selectedStratigraphy}
        setSelectedStratigraphy={setStratigraphy}
      />
      {isEditable && (
        <Box sx={{ marginLeft: "auto" }}>
          <AddButton label={"addStratigraphy"} onClick={createStratigraphy} />
        </Box>
      )}
    </Stack>
  );
};

export default ProfileHeader;
