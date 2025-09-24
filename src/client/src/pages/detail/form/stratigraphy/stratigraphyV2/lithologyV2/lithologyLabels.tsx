import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import type { TFunction } from "i18next";
import { Lithology, LithologyDescription } from "../../lithology";

const uselessStrings = ["keine Angabe", "sans indication", "senza indicazioni", "not specified"];

const getBeddingShare = (lithology: Lithology, index: number) => {
  let beddingShare: number | undefined;
  if (lithology.hasBedding && lithology.share) {
    beddingShare = index === 0 ? lithology.share : 100 - lithology.share;
  }
  return beddingShare;
};

const buildUnconsolidatedPrimaryString = (
  t: TFunction,
  language: string,
  description: LithologyDescription,
  share?: number,
) => {
  const codes = [];
  let primaryValues: string[] = [];

  if (description.lithologyUnconMain) {
    codes.push(description.lithologyUnconMain.code);
    primaryValues.push(description.lithologyUnconMain[language] as string);
  }
  if (description.lithologyUncon2) {
    codes.push(description.lithologyUncon2.code);
    primaryValues.push(description.lithologyUncon2[language] as string);
  }
  if (description.lithologyUncon3) {
    codes.push(description.lithologyUncon3.code);
    primaryValues.push(description.lithologyUncon3[language] as string);
  }
  if (description.lithologyUncon4) {
    codes.push(description.lithologyUncon4.code);
    primaryValues.push(description.lithologyUncon4[language] as string);
  }
  if (description.lithologyUncon5) {
    codes.push(description.lithologyUncon5.code);
    primaryValues.push(description.lithologyUncon5[language] as string);
  }
  if (description.lithologyUncon6) {
    codes.push(description.lithologyUncon6.code);
    primaryValues.push(description.lithologyUncon6[language] as string);
  }
  if (description.componentUnconOrganicCodelists && description.componentUnconOrganicCodelists.length > 0) {
    primaryValues.push(...description.componentUnconOrganicCodelists.map(c => c[language] as string));
  }
  if (description.componentUnconDebrisCodelists && description.componentUnconDebrisCodelists.length > 0) {
    primaryValues.push(...description.componentUnconDebrisCodelists.map(c => c[language] as string));
  }
  if (description.colorPrimary) {
    primaryValues.push(description.colorPrimary[language] as string);
  }
  if (description.colorSecondary) {
    primaryValues.push(description.colorSecondary[language] as string);
  }

  primaryValues = primaryValues.filter(v => !uselessStrings.includes(v));

  const lithologyEnCode = codes.join("-");
  let primaryString = "";
  if (share) {
    primaryString += `${share}%`;
  }
  if (codes.length > 0) {
    if (primaryString.length > 0) primaryString += " ";
    primaryString += `[${lithologyEnCode}]`;
  }
  if (primaryValues.length > 0) {
    primaryString += `: ${primaryValues.join(", ")}`;
  }
  return primaryString;
};

const buildUnconsolidatedSecondaryString = (t: TFunction, language: string, description: LithologyDescription) => {
  let secondaryValues: string[] = [];
  if (description.lithologyUnconDebrisCodelists && description.lithologyUnconDebrisCodelists.length > 0) {
    secondaryValues.push(...description.lithologyUnconDebrisCodelists.map(c => c[language] as string));
  }
  if (description.grainShapeCodelists && description.grainShapeCodelists.length > 0) {
    secondaryValues.push(...description.grainShapeCodelists.map(c => c[language] as string));
  }
  if (description.grainAngularityCodelists && description.grainAngularityCodelists.length > 0) {
    secondaryValues.push(...description.grainAngularityCodelists.map(c => c[language] as string));
  }
  if (description.hasStriae) {
    secondaryValues.push(t("striae"));
  }

  secondaryValues = secondaryValues.filter(v => !uselessStrings.includes(v));
  return `${t("coarseComponent", { count: secondaryValues.length })}: ${secondaryValues.join(", ")}`;
};

const buildUnconsolidatedDetails1String = (t: TFunction, language: string, lithology: Lithology) => {
  const details: string[] = [];
  if (lithology.compactness) details.push(lithology.compactness[language] as string);
  if (lithology.consistency) details.push(lithology.consistency[language] as string);
  if (lithology.cohesion) details.push(lithology.cohesion[language] as string);
  if (lithology.plasticity) details.push(lithology.plasticity[language] as string);
  if (lithology.humidity) details.push(lithology.humidity[language] as string);
  if (lithology.uscsTypeCodelists && lithology.uscsTypeCodelists.length > 0) {
    let uscsString = `${t("uscsClass", { count: lithology.uscsTypeCodelists.length })}: ${lithology.uscsTypeCodelists
      .map(c => c[language] as string)
      .filter(s => !uselessStrings.includes(s))
      .join(", ")}`;
    if (lithology.uscsDetermination && !uselessStrings.includes(lithology.uscsDetermination[language] as string)) {
      uscsString += ` (${lithology.uscsDetermination[language]})`;
    }
    details.push(uscsString);
  }

  return details.filter(d => !uselessStrings.includes(d)).join(", ");
};

const buildUnconsolidatedDetails2String = (language: string, lithology: Lithology) => {
  const details: string[] = [];
  if (lithology.rockConditionCodelists && lithology.rockConditionCodelists.length > 0) {
    details.push(...lithology.rockConditionCodelists.map(c => c[language] as string));
  }
  if (lithology.alterationDegree) details.push(lithology.alterationDegree[language] as string);

  return details.filter(d => !uselessStrings.includes(d)).join(", ");
};

const buildConsolidatedPrimaryString = (
  t: TFunction,
  language: string,
  description: LithologyDescription,
  share?: number,
) => {
  let primaryValues = [];
  if (description.lithologyCon) {
    primaryValues.push(description.lithologyCon[language] as string);
  }
  if (description.componentConParticleCodelists && description.componentConParticleCodelists.length > 0) {
    primaryValues.push(...description.componentConParticleCodelists.map(c => c[language] as string));
  }
  if (description.componentConMineralCodelists && description.componentConMineralCodelists.length > 0) {
    primaryValues.push(...description.componentConMineralCodelists.map(c => c[language] as string));
  }
  if (description.colorPrimary) {
    primaryValues.push(description.colorPrimary[language] as string);
  }
  if (description.colorSecondary) {
    primaryValues.push(description.colorSecondary[language] as string);
  }
  primaryValues = primaryValues.filter(v => !uselessStrings.includes(v));

  let primaryString = "";
  if (share) {
    primaryString += `${share}%: `;
  }

  if (primaryValues.length > 0) {
    primaryString += `${primaryValues.join(", ")}`;
  }
  return primaryString;
};

const buildConsolidatedSecondaryString = (t: TFunction, language: string, description: LithologyDescription) => {
  const secondaryValues: string[] = [];
  if (description.grainSize) {
    secondaryValues.push(description.grainSize[language] as string);
  }
  if (description.grainAngularity) {
    secondaryValues.push(description.grainAngularity[language] as string);
  }
  if (description.gradation) {
    secondaryValues.push(description.gradation[language] as string);
  }
  if (description.cementation) {
    secondaryValues.push(description.cementation[language] as string);
  }
  if (description.structureSynGenCodelists && description.structureSynGenCodelists.length > 0) {
    secondaryValues.push(...description.structureSynGenCodelists.map(c => c[language] as string));
  }
  if (description.structurePostGenCodelists && description.structurePostGenCodelists.length > 0) {
    secondaryValues.push(...description.structurePostGenCodelists.map(c => c[language] as string));
  }

  return secondaryValues.filter(v => !uselessStrings.includes(v)).join(", ");
};

const buildConsolidatedDetailsString = (language: string, lithology: Lithology) => {
  const details: string[] = [];
  if (lithology.textureMetaCodelists && lithology.textureMetaCodelists.length > 0) {
    details.push(...lithology.textureMetaCodelists.map(c => c[language] as string));
  }
  if (lithology.alterationDegree) details.push(lithology.alterationDegree[language] as string);

  return details.filter(d => !uselessStrings.includes(d)).join(", ");
};

const buildLithologyDescription = (
  t: TFunction,
  language: string,
  description: LithologyDescription,
  share: number | undefined,
  buildPrimary: (t: TFunction, language: string, description: LithologyDescription, share?: number) => string,
  buildSecondary: (t: TFunction, language: string, description: LithologyDescription) => string,
) => {
  let primaryString = buildPrimary(t, language, description, share);
  const secondaryString = buildSecondary(t, language, description);

  if (secondaryString.length > 0) primaryString += ", ";

  return (
    <Typography variant="body1" fontWeight={700}>
      {primaryString}
      {secondaryString.length > 0 && (
        <Typography component="span" variant="body1">
          {secondaryString}
        </Typography>
      )}
    </Typography>
  );
};

const buildUnconsolidatedLithologyDescription = (
  t: TFunction,
  language: string,
  description: LithologyDescription,
  share?: number,
) =>
  buildLithologyDescription(
    t,
    language,
    description,
    share,
    buildUnconsolidatedPrimaryString,
    buildUnconsolidatedSecondaryString,
  );

const buildConsolidatedLithologyDescription = (
  t: TFunction,
  language: string,
  description: LithologyDescription,
  share?: number,
) =>
  buildLithologyDescription(
    t,
    language,
    description,
    share,
    buildConsolidatedPrimaryString,
    buildConsolidatedSecondaryString,
  );

interface LithologyLabelsProps {
  lithology: Lithology;
}

export const LithologyLabels: FC<LithologyLabelsProps> = ({ lithology }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  if (lithology.isUnconsolidated) {
    const details1 = buildUnconsolidatedDetails1String(t, language, lithology);
    const details2 = buildUnconsolidatedDetails2String(language, lithology);
    return (
      <>
        {lithology.lithologyDescriptions?.map((description, index) => (
          <div key={`lithologyDescriptions-${description.id}`}>
            {buildUnconsolidatedLithologyDescription(t, language, description, getBeddingShare(lithology, index))}
          </div>
        ))}
        {details1.length > 0 && <Typography variant="body2">{details1}</Typography>}
        {details2.length > 0 && <Typography variant="body2">{details2}</Typography>}
        {lithology.notes && <Typography variant="body2">{lithology.notes}</Typography>}
      </>
    );
  } else {
    const details = buildConsolidatedDetailsString(language, lithology);
    return (
      <>
        {lithology.lithologyDescriptions?.map((description, index) => (
          <div key={`lithologyDescriptions-${description.id}`}>
            {buildConsolidatedLithologyDescription(t, language, description, getBeddingShare(lithology, index))}
          </div>
        ))}
        {details.length > 0 && <Typography variant="body2">{details}</Typography>}
        {lithology.notes && <Typography variant="body2">{lithology.notes}</Typography>}
      </>
    );
  }
};
