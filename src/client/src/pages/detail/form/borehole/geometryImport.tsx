import { FC, useContext, useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material/";
import CopyIcon from "../../../../assets/icons/copy.svg?react";
import { DevTool } from "../../../../../hookformDevtools.ts";
import {
  GeometryFormat,
  getBoreholeGeometryFormats,
  useBoreholeGeometry,
  useBoreholeGeometryMutations,
} from "../../../../api/fetchApiV2.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FormSelect } from "../../../../components/form/form";
import { StackHalfWidth } from "../../../../components/styledComponents.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { FileDropzone } from "./fileDropzone.tsx";

interface GeometryImportProps {
  boreholeId: number;
}

interface GeometryImportForm {
  geometryFormat: string;
  geometryFile: File[];
}

const GeometryImport: FC<GeometryImportProps> = ({ boreholeId }) => {
  const { t, i18n } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  const {
    set: { mutate: setBoreholeGeometry, isPending: isUpdatingBoreholeGeometry },
  } = useBoreholeGeometryMutations();
  const resetTabStatus = useResetTabStatus(["geometry"]);

  const { data } = useBoreholeGeometry(boreholeId);
  const [geometryFormats, setGeometryFormats] = useState<GeometryFormat[]>([]);

  useEffect(() => {
    void getBoreholeGeometryFormats().then(setGeometryFormats);
  }, []);

  const formMethods = useForm<GeometryImportForm>({
    defaultValues: { geometryFormat: "", geometryFile: [] },
  });

  useEffect(() => {
    formMethods.setValue("geometryFormat", geometryFormats?.at(0)?.key ?? "");
  }, [geometryFormats, formMethods]);

  const uploadGeometryCSV = (data: GeometryImportForm) => {
    resetTabStatus();
    const formData = new FormData();
    formData.append("geometryFile", data.geometryFile[0]);
    formData.append("geometryFormat", data.geometryFormat);
    setBoreholeGeometry(
      { boreholeId, formData },
      {
        onError: error => {
          showAlert(error.message ?? t("errorDuringFileUpload"), "error");
        },
      },
    );
  };

  const watch = useWatch({ control: formMethods.control });
  const expectedCSVHeader =
    geometryFormats?.find(f => f.key === formMethods.getValues("geometryFormat"))?.csvHeader ?? "";

  return (
    <>
      <Card>
        <CardContent>
          <DevTool control={formMethods.control} placement="top-left" />
          <FormProvider {...formMethods}>
            <form onSubmit={event => void formMethods.handleSubmit(uploadGeometryCSV)(event)}>
              <Stack direction="row" alignItems="flex-start" pt={3}>
                <StackHalfWidth spacing={2}>
                  <FormSelect
                    fieldName="geometryFormat"
                    label="boreholeGeometryFormat"
                    values={geometryFormats.map(f => ({
                      key: f.key,
                      name: t(`geometryFormat${f.key}`),
                      csvHeader: f.csvHeader,
                    }))}
                    required={true}
                  />
                  {expectedCSVHeader !== "" && (
                    <>
                      <Typography>{t("csvFormatExplanation") + ". " + t("csvOptionalExplanation") + "."}</Typography>
                      <TextField
                        value={expectedCSVHeader}
                        size="small"
                        slotProps={{
                          input: {
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title={t("copyToClipboard")}>
                                  <IconButton onClick={() => void navigator.clipboard.writeText(expectedCSVHeader)}>
                                    <CopyIcon />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </>
                  )}
                </StackHalfWidth>
                <Controller
                  name="geometryFile"
                  control={formMethods.control}
                  render={({ field }) => (
                    <FileDropzone
                      key={i18n.language}
                      onHandleFileChange={field.onChange}
                      defaultText={"dropZoneGeometryText"}
                      acceptedFileTypes={["text/csv"]}
                      maxFilesToSelectAtOnce={1}
                      maxFilesToUpload={1}
                      isDisabled={false}
                      dataCy={"import-geometry-input"}
                    />
                  )}
                />
              </Stack>
            </form>
          </FormProvider>
        </CardContent>
        <CardActions>
          <AddButton
            sx={{ marginLeft: "auto" }}
            label={(data?.length ?? 0) > 0 ? "boreholeGeometryReplace" : "boreholeGeometryImport"}
            onClick={() => void formMethods.handleSubmit(uploadGeometryCSV)()}
            disabled={watch?.geometryFile?.length === 0 || isUpdatingBoreholeGeometry}
            endIcon={isUpdatingBoreholeGeometry && <CircularProgress size="1em" sx={{ color: "currentColor" }} />}
          />
        </CardActions>
      </Card>
    </>
  );
};

export default GeometryImport;
