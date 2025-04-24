import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { t } from "i18next";
import { Photo } from "../../../../api/apiInterfaces.ts";
import { getPhotosByBoreholeId, uploadPhoto } from "../../../../api/fetchApiV2.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { AddAttachmentButton } from "../addAttachmentButton.tsx";
import { PhotosTable } from "./photosTable.tsx";

interface PhotosProps {
  boreholeId: number;
}

export const Photos: FC<PhotosProps> = ({ boreholeId }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { showAlert } = useContext(AlertContext);

  const loadPhotos = useCallback(() => {
    getPhotosByBoreholeId(boreholeId).then(setPhotos);
  }, [boreholeId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const upload = async (file: File) => {
    try {
      await uploadPhoto(boreholeId, file);
      loadPhotos();
    } catch (error) {
      showAlert(t((error as Error).message), "error");
    }
  };

  return (
    <>
      <AddAttachmentButton
        label="addPhoto"
        onFileSelect={upload}
        acceptedFileTypes="image/*"
        dataCy="photo-upload-button"
      />
      {photos && photos.length > 0 ? (
        <Box sx={{ height: "100%" }}>
          <PhotosTable photos={photos} loadPhotos={loadPhotos} />
        </Box>
      ) : (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t("noPhotos")}</Typography>
        </FullPageCentered>
      )}
    </>
  );
};
