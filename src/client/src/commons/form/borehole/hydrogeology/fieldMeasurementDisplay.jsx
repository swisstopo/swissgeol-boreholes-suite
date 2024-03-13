import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { useDomains } from "../../../../api/fetchApiV2";
import { useTranslation } from "react-i18next";
import { TableCell } from "@mui/material";
import { FormResultTableDisplay } from "../../../../components/form/formResultTableDisplay";

const FieldMeasurementDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <ObservationDisplay observation={item} />
      <FormResultTableDisplay
        title={t("fieldMeasurementResult")}
        results={item?.fieldMeasurementResults}
        renderHeader={styles => (
          <>
            <TableCell sx={{ ...styles, paddingRight: 0 }}>{t("sampleType")}</TableCell>
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
