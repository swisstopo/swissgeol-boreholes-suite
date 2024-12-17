import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material/";
import { downloadCodelistCsv } from "../../../../api/fetchApiV2.js";
import { StackHalfWidth } from "../../../../components/styledComponents.ts";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import Downloadlink from "../../../detail/attachments/downloadlink.jsx";
import { FileDropzone } from "../../../detail/attachments/fileDropzone.jsx";
import { ImportContentProps } from "../commons/actionsInterfaces.js";

const ExampleHeadings = (headings: string) => {
  return (
    <Box
      style={{
        border: "thin solid #787878",
        padding: "1em",
        overflow: "auto",
        whiteSpace: "nowrap",
        marginTop: "0.5em",
      }}>
      {headings}
    </Box>
  );
};

const ImportModalContent = ({ setSelectedFile }: ImportContentProps) => {
  const { t } = useTranslation();

  const handleBoreholeFileChange = useCallback(
    (boreholeFileFromDropzone: Blob[]) => {
      setSelectedFile(boreholeFileFromDropzone);
    },
    [setSelectedFile],
  );

  return (
    <>
      <p>
        <Box>
          {t("csvCodeListReferenceExplanation")}
          <Downloadlink style={{ marginLeft: "0.2em" }} caption="Codelist" onDownload={downloadCodelistCsv} />
        </Box>
      </p>
      <h3>{capitalizeFirstLetter(t("boreholes"))}</h3>
      <Stack direction="row" alignItems="flex-start">
        <StackHalfWidth direction="column">
          {t("csvFormatExplanation")}
          {ExampleHeadings(
            "id_geodin_shortname;id_info_geol;id_original;" +
              "id_canton;id_geo_quat;id_geo_mol;id_geo_therm;id_top_fels;" +
              "id_geodin;id_kernlager;original_name;project_name;name;" +
              "restriction_id;restriction_until;national_interest;location_x;location_y;" +
              "location_precision;elevation_z;elevation_precision_id;" +
              "reference_elevation;reference_elevation_type_id;" +
              "qt_reference_elevation_id;hrs_id;type_id;purpose_id;" +
              "status_id;remarks;total_depth;qt_depth_id;top_bedrock_fresh_md;" +
              "top_bedrock_weathered_md;" +
              "has_groundwater;lithology_top_bedrock_id;" +
              "chronostratigraphy_id;lithostratigraphy_id;",
          )}
        </StackHalfWidth>
        <FileDropzone
          onHandleFileChange={handleBoreholeFileChange}
          defaultText={"dropZoneBoreholesText"}
          restrictAcceptedFileTypeToCsv={true}
          maxFilesToSelectAtOnce={1}
          maxFilesToUpload={1}
          isDisabled={false}
          dataCy={"import-boreholeFile-input"}
        />
      </Stack>
    </>
  );
};

export default ImportModalContent;
