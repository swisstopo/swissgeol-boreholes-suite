import { useMemo } from "react";
import { BoreholeV2 } from "../api/borehole";
import { ObservationType } from "../pages/detail/form/hydrogeology/Observation";

export const useBoreholeDataAvailability = (borehole?: BoreholeV2) => {
  return useMemo(() => {
    if (!borehole) {
      return {
        hasSections: false,
        hasGeometry: false,
        hasStratigraphy: false,
        hasCompletion: false,
        hasObservation: false,
        hasWaterIngress: false,
        hasGroundwaterLevelMeasurement: false,
        hasHydroTest: false,
        hasFieldMeasurement: false,
        hasAttachments: false,
        hasBoreholeFiles: false,
        hasPhotos: false,
        hasDocuments: false,
        hasCasings: false,
        hasBackfills: false,
        hasInstrumentations: false,
        hasLithology: false,
        hasLithostratigraphy: false,
        hasChronostratigraphy: false,
        hasLogRuns: false,
      };
    }
    const hasStratigraphy = (borehole.stratigraphies?.length ?? 0) > 0;
    const hasCompletion = (borehole.completions?.length ?? 0) > 0;
    const hasObservation = (borehole.observations?.length ?? 0) > 0;
    const hasSections = (borehole.sections?.length ?? 0) > 0;
    const hasLogRuns = (borehole.logRuns?.length ?? 0) > 0;
    const hasGeometry = borehole.boreholeGeometry !== undefined && borehole.boreholeGeometry !== null;
    const hasWaterIngress =
      hasObservation && (borehole.observations?.some(obs => obs.type === ObservationType.waterIngress) ?? false);
    const hasGroundwaterLevelMeasurement =
      hasObservation &&
      (borehole.observations?.some(obs => obs.type === ObservationType.groundwaterLevelMeasurement) ?? false);
    const hasHydroTest =
      hasObservation && (borehole.observations?.some(obs => obs.type === ObservationType.hydrotest) ?? false);
    const hasFieldMeasurement =
      hasObservation && (borehole.observations?.some(obs => obs.type === ObservationType.fieldMeasurement) ?? false);
    const hasBoreholeFiles = (borehole.boreholeFiles?.length ?? 0) > 0;
    const hasDocuments = (borehole.documents?.length ?? 0) > 0;
    const hasPhotos = (borehole.photos?.length ?? 0) > 0;
    const hasAttachments = hasBoreholeFiles || hasPhotos || hasDocuments;
    const hasCasings =
      hasCompletion && (borehole.completions?.some(completion => completion.casings?.length > 0) ?? false);
    const hasBackfills =
      hasCompletion && (borehole.completions?.some(completion => completion.backfills?.length > 0) ?? false);
    const hasInstrumentations =
      hasCompletion && (borehole.completions?.some(completion => completion.instrumentations?.length > 0) ?? false);
    const hasLithology =
      (hasStratigraphy &&
        borehole.stratigraphies?.some(stratigraphy => (stratigraphy?.lithologies?.length ?? 0) > 0)) ??
      false;
    const hasLithostratigraphy =
      (hasStratigraphy &&
        borehole.stratigraphies?.some(stratigraphy => (stratigraphy?.lithostratigraphyLayers?.length ?? 0) > 0)) ??
      false;
    const hasChronostratigraphy =
      (hasStratigraphy &&
        borehole.stratigraphies?.some(stratigraphy => (stratigraphy?.chronostratigraphyLayers?.length ?? 0) > 0)) ??
      false;

    return {
      hasSections,
      hasGeometry,
      hasStratigraphy,
      hasCompletion,
      hasObservation,
      hasWaterIngress,
      hasGroundwaterLevelMeasurement,
      hasHydroTest,
      hasFieldMeasurement,
      hasAttachments,
      hasBoreholeFiles,
      hasPhotos,
      hasDocuments,
      hasCasings,
      hasBackfills,
      hasInstrumentations,
      hasLithology,
      hasLithostratigraphy,
      hasChronostratigraphy,
      hasLogRuns,
    };
  }, [borehole]);
};
