// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Borehole, BoreholeDataAvailability } from "../api/generated";
import { useBoreholeDataAvailability } from "./useBoreholeDataAvailability";

const noData: BoreholeDataAvailability = {
  hasSections: false,
  hasGeometry: false,
  hasStratigraphy: false,
  hasLithology: false,
  hasLithostratigraphy: false,
  hasChronostratigraphy: false,
  hasCompletion: false,
  hasCasings: false,
  hasBackfills: false,
  hasInstrumentations: false,
  hasObservation: false,
  hasWaterIngress: false,
  hasGroundwaterLevelMeasurement: false,
  hasHydrotest: false,
  hasFieldMeasurement: false,
  hasProfiles: false,
  hasPhotos: false,
  hasDocuments: false,
  hasLogRuns: false,
};

const allFalse = {
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
  hasProfiles: false,
  hasPhotos: false,
  hasDocuments: false,
  hasCasings: false,
  hasBackfills: false,
  hasInstrumentations: false,
  hasLithology: false,
  hasLithostratigraphy: false,
  hasChronostratigraphy: false,
  hasLogRuns: false,
  hasIdentifiers: false,
};

type HookFlag = keyof typeof allFalse;

// Each server flag with the hook output it must set. Most names match; the hook keeps its
// existing name hasHydroTest for the server's hasHydrotest.
const flagMapping: Array<[keyof BoreholeDataAvailability, HookFlag]> = [
  ["hasSections", "hasSections"],
  ["hasGeometry", "hasGeometry"],
  ["hasStratigraphy", "hasStratigraphy"],
  ["hasLithology", "hasLithology"],
  ["hasLithostratigraphy", "hasLithostratigraphy"],
  ["hasChronostratigraphy", "hasChronostratigraphy"],
  ["hasCompletion", "hasCompletion"],
  ["hasCasings", "hasCasings"],
  ["hasBackfills", "hasBackfills"],
  ["hasInstrumentations", "hasInstrumentations"],
  ["hasObservation", "hasObservation"],
  ["hasWaterIngress", "hasWaterIngress"],
  ["hasGroundwaterLevelMeasurement", "hasGroundwaterLevelMeasurement"],
  ["hasHydrotest", "hasHydroTest"],
  ["hasFieldMeasurement", "hasFieldMeasurement"],
  ["hasProfiles", "hasProfiles"],
  ["hasPhotos", "hasPhotos"],
  ["hasDocuments", "hasDocuments"],
  ["hasLogRuns", "hasLogRuns"],
];

const attachmentFlags: Array<keyof BoreholeDataAvailability> = ["hasProfiles", "hasPhotos", "hasDocuments"];

const render = (borehole?: Borehole) => renderHook(() => useBoreholeDataAvailability(borehole)).result.current;

describe("useBoreholeDataAvailability", () => {
  it("returns all false without a borehole", () => {
    expect(render()).toEqual(allFalse);
  });

  it("returns all false when the borehole has no availability", () => {
    expect(render({ id: 1 })).toEqual(allFalse);
  });

  it("covers every server flag in the mapping", () => {
    expect(flagMapping.map(([serverFlag]) => serverFlag).toSorted()).toEqual(Object.keys(noData).toSorted());
  });

  // One flag at a time, so a flag read from the wrong server field fails here.
  it.each(flagMapping)("maps %s to %s and nothing else", (serverFlag, hookFlag) => {
    const expected = { ...allFalse, [hookFlag]: true, hasAttachments: attachmentFlags.includes(serverFlag) };

    expect(render({ id: 1, availability: { ...noData, [serverFlag]: true } })).toEqual(expected);
  });

  it("derives identifiers from the borehole codelists", () => {
    const borehole: Borehole = {
      id: 1,
      availability: noData,
      boreholeCodelists: [{ id: 1, boreholeId: 1, codelistId: 100000006, value: "ID" }],
    };

    expect(render(borehole).hasIdentifiers).toBe(true);
  });
});
