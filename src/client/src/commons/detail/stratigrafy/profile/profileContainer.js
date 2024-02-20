import React, { useState } from "react";
import ProfileView from "./view/profileViewComponent";
import { fetchLayerById, useLayers } from "../../../../api/fetchApiV2";

const ProfileContainer = props => {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [isFetching, setIsFetching] = useState(null);
  const { id } = props;

  const layers = useLayers(id);

  const selectLayer = async selected => {
    setIsFetching(true);
    setSelectedLayer(null);
    const newSelectedLayer = await fetchLayerById(selected.id);
    setIsFetching(false);
    setSelectedLayer(newSelectedLayer);
  };

  if (layers.isLoading || layers?.data?.length === 0) {
    return null;
  }
  return (
    <ProfileView
      data={layers.data}
      handleSelected={selectLayer}
      isFetchingLayer={isFetching}
      layer={selectedLayer}
    />
  );
};

export default ProfileContainer;
