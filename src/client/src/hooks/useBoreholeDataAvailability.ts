import { useMemo } from "react";
import { Borehole } from "../api/generated";

export const useBoreholeDataAvailability = (borehole?: Borehole) => {
  return useMemo(() => {
    const availability = borehole?.availability;
    const hasProfiles = availability?.hasProfiles ?? false;
    const hasPhotos = availability?.hasPhotos ?? false;
    const hasDocuments = availability?.hasDocuments ?? false;

    return {
      hasSections: availability?.hasSections ?? false,
      hasGeometry: availability?.hasGeometry ?? false,
      hasStratigraphy: availability?.hasStratigraphy ?? false,
      hasCompletion: availability?.hasCompletion ?? false,
      hasObservation: availability?.hasObservation ?? false,
      hasWaterIngress: availability?.hasWaterIngress ?? false,
      hasGroundwaterLevelMeasurement: availability?.hasGroundwaterLevelMeasurement ?? false,
      hasHydroTest: availability?.hasHydrotest ?? false,
      hasFieldMeasurement: availability?.hasFieldMeasurement ?? false,
      hasAttachments: hasProfiles || hasPhotos || hasDocuments,
      hasProfiles,
      hasPhotos,
      hasDocuments,
      hasCasings: availability?.hasCasings ?? false,
      hasBackfills: availability?.hasBackfills ?? false,
      hasInstrumentations: availability?.hasInstrumentations ?? false,
      hasLithology: availability?.hasLithology ?? false,
      hasLithostratigraphy: availability?.hasLithostratigraphy ?? false,
      hasChronostratigraphy: availability?.hasChronostratigraphy ?? false,
      hasLogRuns: availability?.hasLogRuns ?? false,
      hasIdentifiers: (borehole?.boreholeCodelists?.length ?? 0) > 0,
    };
  }, [borehole]);
};
