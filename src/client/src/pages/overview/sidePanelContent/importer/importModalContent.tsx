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

const ImportModalContent = ({
  setSelectedFile,
  setFileType,
  fileType,
}: ImportContentProps & { setFileType: (type: string) => void } & { fileType: string | null }) => {
  const { t } = useTranslation();

  const handleCsvFileChange = useCallback(
    (csvFileFromDropzone: Blob[]) => {
      setSelectedFile(csvFileFromDropzone);
    },
    [setSelectedFile],
  );
  const handleJsonFileChange = useCallback(
    (jsonFileFromDropzone: Blob[]) => {
      setSelectedFile(jsonFileFromDropzone);
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
      <h3>{capitalizeFirstLetter(t("importBoreholes"))}</h3>
      <Box
        style={{
          borderBottom: "0.2em solid",
          borderColor: "black",
          marginTop: "1em",
        }}
      />
      <h3>{capitalizeFirstLetter(t("CSV"))}</h3>
      <Stack direction="row" alignItems="flex-start">
        <StackHalfWidth direction="column">
          {t("csvFormatExplanation")}
          {ExampleHeadings(
            "IdOriginal;" +
              "IdCanton;IdGeoQuat;IdGeoMol;IdGeoTherm;IdTopFels;" +
              "IdGeodin;IdKernlager;OriginalName;ProjectName;Name;" +
              "RestrictionId;RestrictionUntil;NationalInterest;LocationX;LocationY;" +
              "LocationPrecision;ElevationZ;ElevationPrecisionId;" +
              "ReferenceElevation;ReferenceElevationTypeId;" +
              "QtReferenceElevationId;HrsId;TypeId;PurposeId;" +
              "StatusId;Remarks;TotalDepth;QtDepthId;TopBedrockFreshMd;" +
              "TopBedrockWeatheredMd;" +
              "HasGroundwater;LithologyTopBedrockId;" +
              "ChronostratigraphyId;LithostratigraphyId;",
          )}
        </StackHalfWidth>
        <FileDropzone
          onHandleFileChange={handleCsvFileChange}
          defaultText={"dropZoneBoreholeCsvText"}
          acceptedFileTypes={["text/csv"]}
          maxFilesToSelectAtOnce={1}
          maxFilesToUpload={1}
          isDisabled={fileType === "json"}
          dataCy={"import-boreholeFile-input"}
          setFileType={setFileType}
        />
      </Stack>
      <h3>{capitalizeFirstLetter(t("JSON"))}</h3>
      <Stack direction="row" alignItems="flex-start">
        <StackHalfWidth direction="column"></StackHalfWidth>
        <FileDropzone
          onHandleFileChange={handleJsonFileChange}
          defaultText={"dropZoneBoreholeJsonText"}
          acceptedFileTypes={["application/json"]}
          maxFilesToSelectAtOnce={1}
          maxFilesToUpload={1}
          isDisabled={fileType === "csv"}
          dataCy={"import-jsonFile-input"}
          setFileType={setFileType}
        />
      </Stack>
    </>
  );
};

export default ImportModalContent;
