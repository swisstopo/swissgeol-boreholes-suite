import { ClassifyResponse } from "../../../../../../api/dataextractionInterfaces.ts";
import { ApiError } from "../../../../../../api/errorClasses.ts";

/**
 * Whether the classification is served from the fixtures below instead of the data extraction
 * service. The service version carrying POST /api/V1/classify is not released, so the real call
 * answers 404 in every environment.
 *
 * Remove this constant together with this module once the endpoint ships. It is deliberately not
 * `import.meta.env.DEV`: the mock is also needed in the deployed dev and test environments, where
 * the service runs without the endpoint, and under Cypress, which serves a production build.
 */
export const useClassificationMock = true;

const mockLatencyMs = 800;

/**
 * Written for the unconsolidated description the design uses, and chosen so that it exercises every
 * awkward part of the mapping: the lowercase `mgr` against the code `MGr`, the escaping underscore
 * of `or_` against `Or`, the compound `GP_GC` against `GP-GC`, `light_grey` against the text
 * `light grey`, and `fragments_splitters` against the text `fragments, splitters`. The four
 * secondaries reproduce the litho code `MGr-fsa-si-co-or` shown in the design.
 */
export const unconsolidatedFixture: ClassifyResponse = {
  consolidation: "unconsolidated",
  en_main: "mgr",
  en_secondary: ["fsa", "si", "co", "or_"],
  uscs: "GP_GC",
  color: "light_grey",
  organic_components: ["remains_of_wood"],
  grain_angularity: ["well_rounded"],
  grain_shape: ["platy"],
  debris: ["rubble", "fragments_splitters"],
};

/** Written for the consolidated description the design uses. */
export const consolidatedFixture: ClassifyResponse = {
  consolidation: "consolidated",
  lithology: "sandstone",
  color: "light_grey",
  cementation: "well_cemented",
  alteration_degree_consolidated: "moderately_weathered",
  mineral_components: ["biotite"],
  accessory_components: ["biodetritus"],
};

/**
 * Stands in for the classification service. The fixture is chosen from the description text so that
 * both the UI and the tests can steer it, and the latency makes the button's spinner observable.
 * @param description The lithological layer description to classify.
 */
export const mockClassify = async (description: string): Promise<ClassifyResponse> => {
  await new Promise(resolve => setTimeout(resolve, mockLatencyMs));
  const text = description.toLowerCase();

  if (text.includes("fehler")) throw new ApiError("errorDataExtraction", 500);
  if (text.includes("keine angabe")) return {};
  if (text.includes("sandstein") || text.includes("kalkstein")) return consolidatedFixture;
  return unconsolidatedFixture;
};
