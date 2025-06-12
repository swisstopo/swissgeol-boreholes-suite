import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TextField, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { detachFile, downloadFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file";
import { BoreholeFile } from "../../../../api/file/fileInterfaces";
import { formatDate } from "../../../../utils.ts";
import { DetailContext } from "../../detailContext";
import { AttachmentContent } from "../attachmentsContent";
import { useAttachments } from "../useAttachments.tsx";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(DetailContext);
  const apiRef = useGridApiRef();

  const loadAttachments = useCallback(async () => {
    const files = await getFiles<BoreholeFile>(boreholeId);
    return files.map(boreholeFile => ({
      id: boreholeFile.fileId,
      ...boreholeFile,
    }));
  }, [boreholeId]);

  const addAttachment = async (file?: File) => {
    if (file) {
      await uploadFile(boreholeId, file);
    }
  };

  const deleteAttachments = async (ids: number[]) => {
    const detachPromises = ids.map(id => detachFile(id));
    await Promise.all(detachPromises);
  };

  const exportAttachments = async (ids: number[]) => {
    const downloadPromises = ids.map(id => downloadFile(id));
    await Promise.all(downloadPromises);
  };

  const updateAttachments = useCallback(
    async (updatedRows: Map<GridRowId, BoreholeFile>) => {
      const updatePromises = Array.from(updatedRows.entries()).map(([id, row]) => {
        const data = apiRef.current.getRowWithUpdatedValues(id, "description");
        if (data) {
          return updateFile(
            boreholeId.toString(),
            id as number,
            row.description ?? data.description,
            row.public ?? data.public,
          );
        }
      });
      await Promise.all(updatePromises);
    },
    [apiRef, boreholeId],
  );

  const {
    isLoading,
    rows,
    onAdd,
    onDelete,
    onExport,
    getPublicColumnHeader,
    getPublicColumnCell,
    updatedRows,
    setUpdatedRows,
  } = useAttachments<BoreholeFile>({
    apiRef,
    loadAttachments,
    addAttachment,
    deleteAttachments,
    exportAttachments,
    updateAttachments,
  });

  const updateDescription = useCallback(
    (id: GridRowId, description: string) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row: BoreholeFile = newMap.get(id) ?? ({ description: "" } as BoreholeFile);
        row.description = description;
        newMap.set(id, row);
        return newMap;
      });
    },
    [setUpdatedRows],
  );

  const getDescriptionField = useCallback(
    (params: GridRenderCellParams<BoreholeFile>, focused: boolean) => {
      const value = updatedRows.get(params.id)?.description ?? params.value ?? "";
      return (
        <TextField
          data-cy="profile-description"
          multiline
          {...(focused ? { defaultValue: value } : { value })}
          onChange={event => updateDescription(params.id, event.target.value)}
        />
      );
    },
    [updateDescription, updatedRows],
  );

  const columns = useMemo<GridColDef<BoreholeFile>[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        flex: 0.5,
        valueGetter: (value, row) => row.file.name,
      },
      {
        field: "description",
        headerName: t("description"),
        editable: editingEnabled,
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          editingEnabled ? (
            getDescriptionField(params, false)
          ) : (
            <Typography sx={{ whiteSpace: "pre-line" }}>{params.value}</Typography>
          ),
        renderEditCell: params => getDescriptionField(params, true),
      },
      {
        field: "created",
        headerName: t("uploaded"),
        resizable: false,
        width: 160,
        renderCell: ({ row }) => formatDate(row.attached, true),
      },
      {
        field: "createdBy",
        headerName: t("user"),
        flex: 0.25,
        valueGetter: (value, row) => row.user?.name ?? "-",
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
    [t, editingEnabled, getPublicColumnHeader, getPublicColumnCell, getDescriptionField],
  );

  return (
    <AttachmentContent<BoreholeFile>
      apiRef={apiRef}
      isLoading={isLoading}
      columns={columns}
      rows={rows}
      addAttachment={onAdd}
      requireFileOnAdd
      deleteAttachments={onDelete}
      exportAttachments={onExport}
      addAttachmentButtonLabel="addProfile"
      noAttachmentsText="noProfiles"
    />
  );
};
