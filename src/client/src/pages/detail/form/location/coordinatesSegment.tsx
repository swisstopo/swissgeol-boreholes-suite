import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Card, CardContent, CardHeader } from "@mui/material";
import { Check, X } from "lucide-react";
import { LabelingButton } from "../../../../components/buttons/labelingButton";
import { FormContainer, FormCoordinate, FormDomainSelect, FormSelect } from "../../../../components/form/form";
import { getPrecisionFromString, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.js";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { DetailContext } from "../../detailContext.tsx";
import { Coordinate, ExtractionState, useLabelingContext } from "../../labeling/labelingInterfaces";
import { boundingBox, referenceSystems } from "./coordinateSegmentConstants";
import {
  Coordinates,
  CoordinatesSegmentProps,
  Direction,
  FieldNameDirectionKeys,
  ReferenceSystemCode,
  ReferenceSystemKey,
} from "./coordinateSegmentInterfaces";
import { LocationFormInputs } from "./locationPanelInterfaces.tsx";

// --- Function component ---
const CoordinatesSegment: React.FC<CoordinatesSegmentProps> = ({
  borehole,
  formMethods,
  setValuesForReferenceSystem,
  setValuesForCountryCantonMunicipality,
  handleCoordinateTransformation,
}) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled } = useContext(DetailContext);
  const { extractionObject, setExtractionObject, setExtractionState, extractionState } = useLabelingContext();

  // --- State variables ---
  const [boreholeId, setBoreholeId] = useState<number>();
  const currentReferenceSystem = formMethods.watch("originalReferenceSystem");

  // --- UseCallback hooks ---

  // --- Utility functions ---
  const updateFormValues = useCallback(
    (refSystem: string, locationX: number | null, locationY: number | null, precisionX: number, precisionY: number) => {
      const locationXString = (locationX && locationX?.toFixed(precisionX)) || "";
      const locationYString = (locationY && locationY?.toFixed(precisionY)) || "";
      setValuesForReferenceSystem(refSystem, locationXString, locationYString);
    },
    [setValuesForReferenceSystem],
  );

  function getCoordinatesFromForm(referenceSystem: string, direction: Direction, value: number): Coordinates {
    const currentFieldName = referenceSystems[referenceSystem].fieldName[direction];

    const LV95XFormValue: string = formMethods.getValues(referenceSystems.LV95.fieldName.X) as string;
    const LV95YFormValue: string = formMethods.getValues(referenceSystems.LV95.fieldName.Y) as string;
    const LV03XFormValue: string = formMethods.getValues(referenceSystems.LV03.fieldName.X) as string;
    const LV03YFormValue: string = formMethods.getValues(referenceSystems.LV03.fieldName.Y) as string;

    const LV95X =
      currentFieldName === referenceSystems.LV95.fieldName.X
        ? value
        : LV95XFormValue
          ? parseFloatWithThousandsSeparator(LV95XFormValue)
          : null;

    const LV95Y =
      currentFieldName === referenceSystems.LV95.fieldName.Y
        ? value
        : LV95XFormValue
          ? parseFloatWithThousandsSeparator(LV95YFormValue)
          : null;

    const LV03X =
      currentFieldName === referenceSystems.LV03.fieldName.X
        ? value
        : LV03XFormValue
          ? parseFloatWithThousandsSeparator(LV03XFormValue)
          : null;

    const LV03Y =
      currentFieldName === referenceSystems.LV03.fieldName.Y
        ? value
        : LV03XFormValue
          ? parseFloatWithThousandsSeparator(LV03YFormValue)
          : null;

    return {
      LV95: { x: LV95X, y: LV95Y },
      LV03: { x: LV03X, y: LV03Y },
    };
  }

  //  --- Effect hooks ---

  // initially validate the form to display errors.
  useEffect(() => {
    formMethods.trigger();
  }, [formMethods.trigger, currentReferenceSystem, formMethods]);

  // reset form values when the borehole changes.
  useEffect(() => {
    const shouldUpdateCoordinates = borehole.id !== boreholeId;
    if (shouldUpdateCoordinates) {
      // Update form values for both reference systems
      updateFormValues(
        ReferenceSystemKey.LV95,
        borehole.locationX,
        borehole.locationY,
        borehole.precisionLocationX,
        borehole.precisionLocationY,
      );
      updateFormValues(
        ReferenceSystemKey.LV03,
        borehole.locationXLV03,
        borehole.locationYLV03,
        borehole.precisionLocationXLV03,
        borehole.precisionLocationYLV03,
      );
      setBoreholeId(borehole.id);
    }
  }, [borehole, boreholeId, setValuesForReferenceSystem, editingEnabled, updateFormValues, formMethods]);

  useEffect(() => {
    if (extractionObject?.type === "coordinates" && extractionState === ExtractionState.success) {
      const coordinate = extractionObject.value as Coordinate;
      if (coordinate) {
        formMethods.setValue("originalReferenceSystem", referenceSystems[coordinate.projection].code);
        setValuesForReferenceSystem(coordinate.projection, coordinate.east.toString(), coordinate.north.toString());
      }
    }
  }, [extractionObject, extractionState, formMethods, setValuesForReferenceSystem]);

  const isCoordinateExtraction = extractionObject?.type === "coordinates";

  // --- Event handlers --- /

  // passed to the onChange handler of the location values. Checks bounding box before updating.
  const onCoordinateChange = (referenceSystem: ReferenceSystemKey, direction: Direction, value: string) => {
    if (!editingEnabled) {
      return;
    }
    // prevent decimal point being removed when typing
    if (value.endsWith(".")) {
      return;
    }
    const sourceSystem = referenceSystem;
    const targetSystem = sourceSystem === ReferenceSystemKey.LV95 ? ReferenceSystemKey.LV03 : ReferenceSystemKey.LV95;

    if (value === "") {
      setValuesForReferenceSystem(targetSystem, "", "");
      return;
    }

    const floatValue = parseFloatWithThousandsSeparator(value);
    // verify coordinates are in bounding box
    if (
      boundingBox[referenceSystem][direction].Min < floatValue &&
      floatValue < boundingBox[referenceSystem][direction].Max
    ) {
      const coordinates: Coordinates = getCoordinatesFromForm(referenceSystem, direction, floatValue);

      const completeLV95 =
        coordinates?.LV95.x != null &&
        coordinates?.LV95.x > 0 &&
        coordinates?.LV95.y !== null &&
        coordinates?.LV95.y > 0;

      const completeLV03 =
        coordinates?.LV03.x !== null &&
        coordinates?.LV03.x > 0 &&
        coordinates?.LV03.y !== null &&
        coordinates?.LV03.y > 0;

      if (
        (referenceSystem === ReferenceSystemKey.LV95 && completeLV95) ||
        (referenceSystem === ReferenceSystemKey.LV03 && completeLV03)
      ) {
        const X = sourceSystem === ReferenceSystemKey.LV95 ? coordinates?.LV95.x : coordinates?.LV03.x;
        const Y = sourceSystem === ReferenceSystemKey.LV95 ? coordinates?.LV95.y : coordinates?.LV03.y;
        const changedCoordinatePrecision = getPrecisionFromString(value);
        const otherCoordinatePrecision = getPrecisionFromString(
          direction === Direction.X
            ? formMethods.getValues(referenceSystems[referenceSystem].fieldName.Y)
            : formMethods.getValues(referenceSystems[referenceSystem].fieldName.X),
        );
        const X_precision = direction === Direction.X ? changedCoordinatePrecision : otherCoordinatePrecision;
        const Y_precision = direction === Direction.Y ? changedCoordinatePrecision : otherCoordinatePrecision;

        if (X !== null && Y !== null) {
          handleCoordinateTransformation(sourceSystem, targetSystem, X, Y, X_precision, Y_precision);
        }
      }
    }
  };

  const confirmCoordinateChange = () => {
    setValuesForReferenceSystem(ReferenceSystemKey.LV03, "", "");
    setValuesForReferenceSystem(ReferenceSystemKey.LV95, "", "");
    setValuesForCountryCantonMunicipality({ country: "", canton: "", municipality: "" });
  };

  const onCancelCoordinateChange = (e: number) => {
    formMethods.resetField("originalReferenceSystem");
    formMethods.setValue(
      "originalReferenceSystem",
      Object.values(ReferenceSystemCode).find(code => typeof code === "number" && code !== e) as ReferenceSystemCode,
    );
  };

  // Resets the form and updates the reference system.
  const resetCoordinatesOnReferenceSystemChange = (e: number | boolean | null) => {
    if (typeof e !== "number") return;
    const areCoordinatesSet = Object.keys(FieldNameDirectionKeys).some(field =>
      formMethods.getValues(field as keyof LocationFormInputs),
    );
    if (!areCoordinatesSet) {
      confirmCoordinateChange();
      return;
    }

    showPrompt(t("changingCoordinateSystemResetsCoordinates"), [
      {
        label: t("cancel"),
        icon: <X />,
        variant: "outlined",
        action: () => onCancelCoordinateChange(e),
      },
      {
        label: t("confirm"),
        icon: <Check />,
        variant: "contained",
        action: confirmCoordinateChange,
      },
    ]);
  };

  const startLabeling = () => {
    const referenceSystemKey =
      currentReferenceSystem === referenceSystems.LV95.code ? ReferenceSystemKey.LV95 : ReferenceSystemKey.LV03;
    setExtractionObject({
      type: "coordinates",
      previousValue: {
        east: formMethods.getValues(referenceSystems[referenceSystemKey].fieldName.X),
        north: formMethods.getValues(referenceSystems[referenceSystemKey].fieldName.Y),
        projection: referenceSystemKey,
      },
    });
    setExtractionState(ExtractionState.start);
  };

  return (
    <>
      {borehole && (
        <FormSegmentBox>
          <Card data-cy="coordinate-segment">
            <CardHeader
              title={t("coordinates")}
              sx={{ p: 4, pb: 3 }}
              titleTypographyProps={{ variant: "h5" }}
              action={
                <Box sx={{ visibility: editingEnabled ? "visible" : "hidden" }}>
                  <LabelingButton
                    className={extractionObject?.type === "coordinates" ? "Mui-active" : ""}
                    onClick={() => startLabeling()}
                  />
                </Box>
              }
            />
            <CardContent sx={{ pt: 4, px: 3 }}>
              <FormContainer>
                <FormSelect
                  canReset={false}
                  fieldName={"originalReferenceSystem"}
                  label="spatial_reference_system"
                  selected={borehole.originalReferenceSystem}
                  className={isCoordinateExtraction ? "ai" : ""}
                  onUpdate={resetCoordinatesOnReferenceSystemChange}
                  values={Object.entries(referenceSystems).map(([, value]) => ({
                    key: value.code,
                    name: value.name,
                  }))}
                />
                <FormContainer direction="row">
                  <FormContainer width={"50%"}>
                    <FormCoordinate
                      fieldName={FieldNameDirectionKeys.locationX}
                      referenceSystem={ReferenceSystemKey.LV95}
                      direction={Direction.X}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV95.code}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.watch(referenceSystems.LV95.fieldName.X)}
                    />
                    <FormCoordinate
                      fieldName={FieldNameDirectionKeys.locationY}
                      referenceSystem={ReferenceSystemKey.LV95}
                      direction={Direction.Y}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV95.code}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.watch(referenceSystems.LV95.fieldName.Y)}
                    />
                  </FormContainer>
                  <FormContainer width={"50%"}>
                    <FormCoordinate
                      fieldName={FieldNameDirectionKeys.locationXLV03}
                      referenceSystem={ReferenceSystemKey.LV03}
                      direction={Direction.X}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV03.code}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.watch(referenceSystems.LV03.fieldName.X)}
                    />
                    <FormCoordinate
                      fieldName={FieldNameDirectionKeys.locationYLV03}
                      referenceSystem={ReferenceSystemKey.LV03}
                      direction={Direction.Y}
                      onUpdate={onCoordinateChange}
                      disabled={currentReferenceSystem !== referenceSystems.LV03.code}
                      className={isCoordinateExtraction ? "ai" : ""}
                      value={formMethods.watch(referenceSystems.LV03.fieldName.Y)}
                    />
                  </FormContainer>
                </FormContainer>
                <FormDomainSelect
                  fieldName={"locationPrecisionId"}
                  label="location_precision"
                  schemaName={"location_precision"}
                  selected={borehole.locationPrecisionId}
                />
              </FormContainer>
            </CardContent>
          </Card>
        </FormSegmentBox>
      )}
    </>
  );
};

export default CoordinatesSegment;
