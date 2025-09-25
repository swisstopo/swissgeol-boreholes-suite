import { UseFormReturn } from "react-hook-form";
import { Codelist } from "../../../../../../../components/codelist.ts";
import { Lithology, LithologyDescription } from "../../../lithology.ts";

export function initializeLithologyInForm<TFieldValues>(
  formMethods: UseFormReturn<Lithology, TFieldValues>,
  lithology: Lithology,
) {
  // TODO: Decide based on previous value
  formMethods.setValue("isUnconsolidated", lithology?.isUnconsolidated ?? true);
  formMethods.setValue("rockConditionCodelistIds", lithology.rockConditionCodelists?.map((c: Codelist) => c.id) ?? []);
  formMethods.setValue("uscsTypeCodelistIds", lithology.uscsTypeCodelists?.map((c: Codelist) => c.id) ?? []);
  formMethods.setValue("textureMetaCodelistIds", lithology.textureMetaCodelists?.map((c: Codelist) => c.id) ?? []);
  formMethods.setValue("alterationDegreeId", lithology?.alterationDegreeId ?? null);
  formMethods.setValue("alterationDegreeId", lithology?.alterationDegreeId ?? null);
  formMethods.setValue("compactnessId", lithology?.compactnessId ?? null);
  formMethods.setValue("consistencyId", lithology?.consistencyId ?? null);
  formMethods.setValue("cohesionId", lithology?.cohesionId ?? null);
  formMethods.setValue("humidityId", lithology?.humidityId ?? null);
  formMethods.setValue("uscsDeterminationId", lithology?.uscsDeterminationId ?? null);
  formMethods.setValue("plasticityId", lithology?.plasticityId ?? null);
}

export function initializeLithologicalDescriptionInForm<TFieldValues>(
  index: number,
  description: LithologyDescription,
  formMethods: UseFormReturn<Lithology, TFieldValues>,
) {
  formMethods.setValue(
    `lithologyDescriptions.${index}.componentUnconOrganicCodelistIds`,
    description.componentUnconOrganicCodelists?.map((c: Codelist) => c.id) ?? [],
  );
  formMethods.setValue(
    `lithologyDescriptions.${index}.componentUnconDebrisCodelistIds`,
    description.componentUnconDebrisCodelists?.map((c: Codelist) => c.id) ?? [],
  );
  formMethods.setValue(
    `lithologyDescriptions.${index}.lithologyUnconDebrisCodelistIds`,
    description.lithologyUnconDebrisCodelists?.map((c: Codelist) => c.id) ?? [],
  );
  formMethods.setValue(
    `lithologyDescriptions.${index}.componentConParticleCodelistIds`,
    description.componentConParticleCodelists?.map((c: Codelist) => c.id) ?? [],
  );
  formMethods.setValue(
    `lithologyDescriptions.${index}.structurePostGenCodelistIds`,
    description.structurePostGenCodelists?.map((c: Codelist) => c.id) ?? [],
  );
  formMethods.setValue(
    `lithologyDescriptions.${index}.structureSynGenCodelistIds`,
    description.structureSynGenCodelists?.map((c: Codelist) => c.id) ?? [],
  );
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyConId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.colorPrimaryId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.colorSecondaryId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.grainSizeId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.grainAngularityId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.gradationId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.cementationId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUnconMainId`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon2Id`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon3Id`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon4Id`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon5Id`, null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon6Id`, null);
}
