import { UseFormReturn } from "react-hook-form";
import { Lithology, LithologyDescription } from "../../../lithology.ts";

export function initializeLithologyInForm<TFieldValues>(
  formMethods: UseFormReturn<Lithology, TFieldValues>,
  lithology: Lithology,
) {
  formMethods.setValue("isUnconsolidated", lithology?.isUnconsolidated ?? true);
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
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyConId`, description.lithologyConId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.colorPrimaryId`, description.colorPrimaryId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.colorSecondaryId`, description.colorSecondaryId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.grainSizeId`, description.grainSizeId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.grainAngularityId`, description.grainAngularityId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.gradationId`, description.gradationId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.cementationId`, description.cementationId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUnconMainId`, description.lithologyUnconMainId ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon2Id`, description.lithologyUncon2Id ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon3Id`, description.lithologyUncon3Id ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon4Id`, description.lithologyUncon4Id ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon5Id`, description.lithologyUncon5Id ?? null);
  formMethods.setValue(`lithologyDescriptions.${index}.lithologyUncon6Id`, description.lithologyUncon6Id ?? null);
}
