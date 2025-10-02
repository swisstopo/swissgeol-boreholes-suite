import { UseFormReturn } from "react-hook-form";
import { Lithology, LithologyDescription } from "../../../lithology.ts";

export function prepareLithologyForSubmit(values: Lithology) {
  delete values.shareInverse;
  delete values.alterationDegree;
  delete values.compactness;
  delete values.cohesion;
  delete values.humidity;
  delete values.consistency;
  delete values.plasticity;
  delete values.uscsDetermination;
  delete values.uscsTypeCodelists;
  delete values.rockConditionCodelists;
  delete values.textureMetaCodelists;
  if (String(values.alterationDegreeId) === "") values.alterationDegreeId = null;
  if (String(values.compactnessId) === "") values.compactnessId = null;
  if (String(values.cohesionId) === "") values.cohesionId = null;
  if (String(values.humidityId) === "") values.humidityId = null;
  if (String(values.consistencyId) === "") values.consistencyId = null;
  if (String(values.plasticityId) === "") values.plasticityId = null;
  if (String(values.uscsDeterminationId) === "") values.uscsDeterminationId = null;

  if (values?.lithologyDescriptions) {
    for (const description of values.lithologyDescriptions) {
      delete description.colorPrimary;
      delete description.colorSecondary;
      delete description.lithologyUnconMain;
      delete description.lithologyUncon2;
      delete description.lithologyUncon3;
      delete description.lithologyUncon4;
      delete description.lithologyUncon5;
      delete description.lithologyUncon6;
      delete description.componentUnconOrganicCodelists;
      delete description.componentUnconDebrisCodelists;
      delete description.grainShapeCodelists;
      delete description.grainAngularityCodelists;
      delete description.lithologyUnconDebrisCodelists;
      delete description.lithologyCon;
      delete description.componentConParticleCodelists;
      delete description.componentConMineralCodelists;
      delete description.grainSize;
      delete description.grainAngularity;
      delete description.gradation;
      delete description.cementation;
      delete description.structureSynGenCodelists;
      delete description.structurePostGenCodelists;

      if (String(description.lithologyUnconMainId) === "") description.lithologyUnconMainId = null;
      if (String(description.lithologyUncon2Id) === "") description.lithologyUncon2Id = null;
      if (String(description.lithologyUncon3Id) === "") description.lithologyUncon3Id = null;
      if (String(description.lithologyUncon4Id) === "") description.lithologyUncon4Id = null;
      if (String(description.lithologyUncon5Id) === "") description.lithologyUncon5Id = null;
      if (String(description.lithologyUncon6Id) === "") description.lithologyUncon6Id = null;
      if (String(description.lithologyConId) === "") description.lithologyConId = null;
      if (String(description.grainSizeId) === "") description.grainSizeId = null;
      if (String(description.grainAngularityId) === "") description.grainAngularityId = null;
      if (String(description.gradationId) === "") description.gradationId = null;
      if (String(description.cementationId) === "") description.cementationId = null;
    }
  }
}

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
