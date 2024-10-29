import { useContext, useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
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
  getBoreholeGeometryFormats,
  useBoreholeGeometry,
  useBoreholeGeometryMutations,
} from "../../../../api/fetchApiV2.js";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FormSelect } from "../../../../components/form/form";
import { StackHalfWidth } from "../../../../components/styledComponents.ts";
import { FileDropzone } from "../../attachments/fileDropzone.jsx";

const GeometryImport = ({ boreholeId }) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  const {
    set: { mutate: setBoreholeGeometry, isLoading: isUpdatingBoreholeGeometry },
  } = useBoreholeGeometryMutations();
  const { data } = useBoreholeGeometry(boreholeId);
  const [geometryFormats, setGeometryFormats] = useState([]);

  useEffect(() => {
    getBoreholeGeometryFormats().then(setGeometryFormats);
  }, []);

  const formMethods = useForm({
    defaultValues: { geometryFormat: "", geometryFile: [] },
  });

  useEffect(() => {
    formMethods.setValue("geometryFormat", geometryFormats?.at(0)?.key);
  }, [geometryFormats, formMethods]);

  const uploadGeometryCSV = data => {
    let formData = new FormData();
    formData.append("geometryFile", data.geometryFile[0]);
    formData.append("geometryFormat", data.geometryFormat);
    setBoreholeGeometry(
      { boreholeId, formData },
      {
        onSuccess: async data => {
          // fetch does not fail promises on 4xx or 5xx responses
          // ¯\_(ツ)_/¯
          if (!data.ok) {
            data.json().then(msg => showAlert(msg.detail ?? t("errorDuringBoreholeFileUpload"), "error"));
          }
        },
      },
    );
  };

  const expectedCSVHeader =
    geometryFormats?.find(f => f.key === formMethods.getValues("geometryFormat"))?.csvHeader ?? "";

  return (
    <>
      <Card>
        <CardContent>
          <DevTool control={formMethods.control} placement="top-left" />
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(uploadGeometryCSV)}>
              <Stack direction="row" alignItems="flex-start">
                <StackHalfWidth spacing={2}>
                  <FormSelect
                    fieldName="geometryFormat"
                    label="boreholeGeometryFormat"
                    values={geometryFormats}
                    required={true}
                  />
                  {expectedCSVHeader !== "" && (
                    <>
                      <Typography>{t("csvFormatExplanation") + ". " + t("csvOptionalExplanation") + "."}</Typography>
                      <TextField
                        value={expectedCSVHeader}
                        size="small"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={t("copyToClipboard")}>
                                <IconButton onClick={() => navigator.clipboard.writeText(expectedCSVHeader)}>
                                  <CopyIcon />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
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
                      onHandleFileChange={field.onChange}
                      defaultText={"dropZoneGeometryText"}
                      restrictAcceptedFileTypeToCsv={true}
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
            label={data?.length > 0 ? "boreholeGeometryReplace" : "boreholeGeometryImport"}
            onClick={formMethods.handleSubmit(uploadGeometryCSV)}
            disabled={watch?.geometryFile?.length === 0 || isUpdatingBoreholeGeometry}
            endIcon={isUpdatingBoreholeGeometry && <CircularProgress size="1em" sx={{ color: "currentColor" }} />}
          />
        </CardActions>
      </Card>
    </>
  );
};

export default GeometryImport;
