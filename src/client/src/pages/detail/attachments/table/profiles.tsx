import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Stack, TextField, Typography } from "@mui/material";
import { GridColDef, GridColumnHeaderParams, GridRenderCellParams, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { CheckIcon } from "lucide-react";
import { detachFile, downloadFile, getFiles, updateFile, uploadFile } from "../../../../api/file/file";
import { BoreholeFile } from "../../../../api/file/fileInterfaces";
import { theme } from "../../../../AppTheme.ts";
import DateText from "../../../../components/legacyComponents/dateText";
import { DetailContext } from "../../detailContext";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";
import { AttachmentContent } from "../attachmentsContent";

interface ProfilesProps {
  boreholeId: number;
}

export const Profiles: FC<ProfilesProps> = ({ boreholeId }) => {
  const { t } = useTranslation();
  const apiRef = useGridApiRef();
  const { editingEnabled } = useContext(DetailContext);
  const { hasChanges, markAsChanged } = useContext<SaveContextProps>(SaveContext);

  const [updatedRows, setUpdatedRows] = useState<
    Map<
      GridRowId,
      {
        description: string;
        public: boolean;
      }
    >
  >(new Map());
  const [allProfilesPublic, setAllProfilesPublic] = useState(false);
  const [someProfilesPublic, setSomeProfilesPublic] = useState(false);

  const loadProfiles = useCallback(async () => {
    const files = await getFiles<BoreholeFile>(boreholeId);
    return files.map(boreholeFile => ({
      id: boreholeFile.fileId,
      ...boreholeFile,
    }));
  }, [boreholeId]);

  const addProfile = async (file: File) => {
    await uploadFile(boreholeId, file);
  };

  const deleteProfiles = async (ids: number[]) => {
    const downloadPromises = ids.map(id => detachFile(boreholeId.toString(), id));
    await Promise.all(downloadPromises);
  };

  const exportProfiles = async (ids: number[]) => {
    const downloadPromises = ids.map(id => downloadFile(id));
    await Promise.all(downloadPromises);
  };

  const updateDescription = useCallback((id: GridRowId, description: string) => {
    setUpdatedRows(prevRows => {
      const newMap = new Map(prevRows);
      const row = newMap.get(id) ?? { description: "", public: false };
      row.description = description;
      newMap.set(id, row);
      return newMap;
    });
  }, []);

  const togglePublicValueForRow = useCallback(
    (id: GridRowId, checked: boolean) => {
      setUpdatedRows(prevRows => {
        const newMap = new Map(prevRows);
        const row = newMap.get(id) ?? { description: "", public: false };
        row.public = checked;
        newMap.set(id, row);
        return newMap;
      });
      apiRef.current.updateRows([{ id, public: checked }]);
    },
    [apiRef],
  );

  const toggleAllPublicValues = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      const currentRows = apiRef.current.getRowModels();
      Array.from(currentRows.keys()).forEach(id => {
        togglePublicValueForRow(id, checked);
      });
    },
    [apiRef, togglePublicValueForRow],
  );

  const updateProfiles = useCallback(async () => {
    const updatePromises = Array.from(updatedRows.entries()).map(([id, row]) => {
      return updateFile(boreholeId.toString(), id as number, row.description, row.public);
    });
    await Promise.all(updatePromises);
    setUpdatedRows(new Map());
  }, [boreholeId, updatedRows]);

  useEffect(() => {
    if (updatedRows.size > 0 && !hasChanges) {
      markAsChanged(true);
    }
  }, [hasChanges, markAsChanged, updatedRows]);

  useEffect(() => {
    if (apiRef.current.getRowModels) {
      const currentRows = apiRef.current.getRowModels();
      setAllProfilesPublic(Array.from(currentRows.values()).every(row => row.public));
      setSomeProfilesPublic(Array.from(currentRows.values()).some(row => row.public));
    }
  }, [apiRef, updatedRows]);

  const columns = useMemo<GridColDef[]>(
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
            <TextField
              sx={{ margin: 0 }}
              value={updatedRows.get(params.id)?.description ?? params.value}
              onChange={event => updateDescription(params.id, event.target.value)}
            />
          ) : (
            <Typography sx={{ fontSize: "16px", fontWeight: 400 }}>{params.value}</Typography>
          ),
        renderEditCell: (params: GridRenderCellParams) => (
          <TextField
            sx={{ margin: `0 ${theme.spacing(1)}` }}
            defaultValue={params.value}
            onChange={event => updateDescription(params.id, event.target.value)}
          />
        ),
      },
      {
        field: "type",
        headerName: t("type"),
        flex: 0.5,
        valueGetter: (value, row) => row.file.type,
      },
      {
        field: "created",
        headerName: t("uploaded"),
        resizable: false,
        width: 150,
        renderCell: ({ row }) => <DateText date={row.attached} hours />,
      },
      {
        field: "createdBy",
        headerName: t("user"),
        flex: 0.5,
        valueGetter: (value, row) => row.user?.name ?? "-",
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        editable: editingEnabled,
        resizable: false,
        width: 150,
        renderHeader: editingEnabled
          ? (params: GridColumnHeaderParams) => (
              <Stack flexDirection="row" justifyContent="flex-start" alignItems="center" gap={1}>
                <Checkbox
                  checked={allProfilesPublic}
                  indeterminate={someProfilesPublic && !allProfilesPublic}
                  onChange={toggleAllPublicValues}
                />
                <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>{params.colDef.headerName}</Typography>
              </Stack>
            )
          : undefined,
        renderCell: (params: GridRenderCellParams) => (
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-start" width="100%">
            {editingEnabled ? (
              <Checkbox
                checked={params.row.public}
                onChange={event => togglePublicValueForRow(params.row.id, event.target.checked)}
              />
            ) : params.value ? (
              <CheckIcon />
            ) : null}
          </Stack>
        ),
      },
    ],
    [
      t,
      editingEnabled,
      updateDescription,
      allProfilesPublic,
      someProfilesPublic,
      toggleAllPublicValues,
      togglePublicValueForRow,
    ],
  );

  return (
    <AttachmentContent
      apiRef={apiRef}
      columns={columns}
      addAttachment={addProfile}
      getAttachments={loadProfiles}
      deleteAttachments={deleteProfiles}
      exportAttachments={exportProfiles}
      saveChanges={updateProfiles}
      resetChanges={() => setUpdatedRows(new Map())}
      addAttachmentButtonLabel="addProfile"
      noAttachmentsText="noProfiles"
    />
  );
};
