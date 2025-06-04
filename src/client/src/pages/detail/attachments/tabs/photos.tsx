import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GridColDef, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { Photo } from "../../../../api/apiInterfaces.ts";
import {
  deletePhotos,
  exportPhotos,
  getPhotosByBoreholeId,
  updatePhotos,
  uploadPhoto,
} from "../../../../api/fetchApiV2.ts";
import { formatDate } from "../../../../utils.ts";
import { DetailContext } from "../../detailContext.tsx";
import { AttachmentContent } from "../attachmentsContent.tsx";
import { useAttachments } from "../useAttachments.tsx";

interface PhotosProps {
  boreholeId: number;
}

export const Photos: FC<PhotosProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const apiRef = useGridApiRef();

  const loadAttachments = useCallback(() => {
    return getPhotosByBoreholeId(boreholeId);
  }, [boreholeId]);

  const addAttachment = async (file: File) => {
    await uploadPhoto(boreholeId, file);
  };

  const deleteAttachments = async (ids: number[]) => {
    await deletePhotos(ids);
  };

  const exportAttachments = async (ids: number[]) => {
    await exportPhotos(ids);
  };

  const updateAttachments = useCallback(async (updatedRows: Map<GridRowId, Photo>) => {
    const updatedRowsArray = Array.from(updatedRows.entries()).map(([key, value]) => ({
      id: key as number,
      public: value.public ?? false,
    }));
    await updatePhotos(updatedRowsArray);
  }, []);

  const { isLoading, rows, onAdd, onDelete, onExport, getPublicColumnHeader, getPublicColumnCell } = useAttachments({
    apiRef,
    loadAttachments,
    addAttachment,
    deleteAttachments,
    exportAttachments,
    updateAttachments,
  });

  const columns = useMemo<GridColDef<Photo>[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
      },
      {
        field: "created",
        headerName: t("uploaded"),
        resizable: false,
        width: 160,
        renderCell: ({ row }) => formatDate(row.created, true),
      },
      {
        field: "createdBy",
        headerName: t("user"),
        valueGetter: (value, row) => row.createdBy?.name ?? "-",
      },
      {
        field: "depth",
        headerName: t("depthMD"),
        resizable: false,
        width: 150,
        valueGetter: (value, row) => `${row.fromDepth} - ${row.toDepth}`,
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        editable: editingEnabled,
        resizable: false,
        width: editingEnabled ? 150 : 100,
        renderHeader: getPublicColumnHeader,
        renderCell: getPublicColumnCell,
      },
    ],
    [t, editingEnabled, getPublicColumnHeader, getPublicColumnCell],
  );

  return (
    <AttachmentContent<Photo>
      apiRef={apiRef}
      isLoading={isLoading}
      columns={columns}
      rows={rows}
      addAttachment={onAdd}
      acceptedFileTypes="image/*"
      deleteAttachments={onDelete}
      exportAttachments={onExport}
      addAttachmentButtonLabel="addPhoto"
      noAttachmentsText="noPhotos"
    />
  );
};
