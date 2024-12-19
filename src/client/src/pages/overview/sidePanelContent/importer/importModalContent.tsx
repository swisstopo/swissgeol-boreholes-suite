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
              "ChronostratigraphyTopBedrockId;LithostratigraphyTopBedrockId;",
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
