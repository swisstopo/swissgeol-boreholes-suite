import { FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TextField, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { detachFile, downloadFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file";
import { Profile } from "../../../../api/file/fileInterfaces";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";
import { formatDate } from "../../../../utils.ts";
import { EditStateContext } from "../../editStateContext";
import { AttachmentContent } from "../attachmentsContent";
import { useAttachments } from "../useAttachments.tsx";
import { useInvalidateProfiles } from "../useProfiles.tsx";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const apiRef = useGridApiRef();
  const showApiErrorAlert = useApiErrorAlert();
  const invalidateProfiles = useInvalidateProfiles();

  const loadAttachments = useCallback(async () => {
    const files = await getFiles<Profile>(boreholeId);
    return files.map(profile => ({
      id: profile.fileId,
      ...profile,
    }));
  }, [boreholeId]);

  const addAttachment = async (file?: File) => {
    if (file) {
      await uploadFile(boreholeId, file);
      invalidateProfiles();
    }
  };

  const deleteAttachments = async (ids: number[]) => {
    const detachPromises = ids.map(id => detachFile(id));
    await Promise.all(detachPromises);
    invalidateProfiles();
  };

  const exportAttachments = async (ids: number[]) => {
    const downloadPromises = ids.map(id => downloadFile(id));
    await Promise.all(downloadPromises);
  };

  const updateAttachments = useCallback(
    async (updatedRows: Map<GridRowId, Profile>) => {
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
        return Promise.resolve();
      });
      const results = await Promise.allSettled(updatePromises);
      invalidateProfiles();
      const errors = results.filter(r => r.status === "rejected").map(r => r.reason);
      if (errors.length > 0) {
        showApiErrorAlert(errors.map(e => e.message).join(", "));
        return false;
      }
      return true;
    },
    [apiRef, boreholeId, invalidateProfiles, showApiErrorAlert],
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
  } = useAttachments<Profile>({
    apiRef,
    loadAttachments,
    addAttachment,
    deleteAttachments,
    exportAttachments,
    updateAttachments,
    tabStatusToReset: "profiles",
  });

  const updateDescription = useCallback(
    (id: GridRowId, description: string) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row: Profile = newMap.get(id) ?? ({ description: "" } as Profile);
        row.description = description;
        newMap.set(id, row);
        return newMap;
      });
    },
    [setUpdatedRows],
  );

  const getDescriptionField = useCallback(
    (params: GridRenderCellParams<Profile>, focused: boolean) => {
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

  const columns = useMemo<GridColDef<Profile>[]>(
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
    <AttachmentContent<Profile>
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
