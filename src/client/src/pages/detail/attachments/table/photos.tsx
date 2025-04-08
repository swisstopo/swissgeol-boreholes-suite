import { FC, useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { t } from "i18next";
import { Photo } from "../../../../api/apiInterfaces.ts";
import { getPhotosByBoreholeId } from "../../../../api/fetchApiV2.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { PhotosTable } from "./photosTable.tsx";

interface PhotosProps {
  boreholeId: number;
}

export const Photos: FC<PhotosProps> = ({ boreholeId }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const loadPhotos = useCallback(() => {
    getPhotosByBoreholeId(boreholeId).then(setPhotos);
  }, [boreholeId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return (
    <>
      {photos && photos.length > 0 ? (
        <Box sx={{ height: "100%" }}>
          <PhotosTable photos={photos} />
        </Box>
      ) : (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t("noAttachments")}</Typography>
        </FullPageCentered>
      )}
    </>
  );
};
