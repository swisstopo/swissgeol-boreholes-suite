import ObservationDisplay from "./observationDisplay";
import { useTranslation } from "react-i18next";
import { TableCell } from "@mui/material";
import { getFieldMeasurementParameterUnits } from "./parameterUnits";
import { deleteFieldMeasurement, useDomains } from "../../../../api/fetchApiV2.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { FormResultTableDisplay } from "../../../../components/form/formResultTableDisplay.tsx";

const FieldMeasurementDisplay = props => {
  const { item, isEditable } = props;
  const domains = useDomains();
  const { t, i18n } = useTranslation();

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteFieldMeasurement}>
      <ObservationDisplay observation={item} />
      <FormResultTableDisplay
        title={t("fieldMeasurementResult")}
        results={item?.fieldMeasurementResults}
        renderHeader={styles => (
          <>
            <TableCell sx={{ ...styles, paddingRight: 0 }}>{t("fieldMeasurementSampleType")}</TableCell>
            <TableCell sx={styles}>{t("parameter")}</TableCell>
            <TableCell sx={styles}>{t("value")}</TableCell>
          </>
        )}
        renderBody={(result, index, styles) => (
          <>
            <TableCell sx={styles} data-cy={`fieldMeasurementResult.${index}.sampleType-formDisplay`}>
              {domains?.data?.find(d => d.id === result.sampleTypeId)?.[i18n.language] || ""}
            </TableCell>
            <TableCell
              component="th"
              scope="row"
              sx={{
                ...styles,
                "& .MuiFormControl-root": {
                  minWidth: "100%",
                  maxWidth: "100%",
                },
                pr: "3px",
                pl: "3px",
                maxWidth: "200px",
                minWidth: "200px",
              }}
              data-cy={`fieldMeasurementResult.${index}.parameter-formDisplay`}>
              {domains?.data?.find(d => d.id === result.parameterId)?.[i18n.language] || ""}
            </TableCell>
            <TableCell sx={styles} data-cy={`fieldMeasurementResult.${index}.value-formDisplay`}>
              {result?.value && (
                <>
                  <span>{result?.value + " "}</span>
                  {getFieldMeasurementParameterUnits(result.parameterId, domains.data)}
                </>
              )}
            </TableCell>
          </>
        )}
      />
    </DataDisplayCard>
  );
};

export default FieldMeasurementDisplay;
