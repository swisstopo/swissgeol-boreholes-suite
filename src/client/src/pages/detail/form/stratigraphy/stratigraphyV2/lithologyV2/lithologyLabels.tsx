import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import type { TFunction } from "i18next";
import { Lithology, LithologyDescription } from "../../lithology";

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
  const primaryValues = [];

  if (description.lithologyUnconMain) {
    codes.push(description.lithologyUnconMain.code);
    primaryValues.push(description.lithologyUnconMain[language]);
  }
  if (description.lithologyUncon2) {
    codes.push(description.lithologyUncon2.code);
    primaryValues.push(description.lithologyUncon2[language]);
  }
  if (description.lithologyUncon3) {
    codes.push(description.lithologyUncon3.code);
    primaryValues.push(description.lithologyUncon3[language]);
  }
  if (description.lithologyUncon4) {
    codes.push(description.lithologyUncon4.code);
    primaryValues.push(description.lithologyUncon4[language]);
  }
  if (description.lithologyUncon5) {
    codes.push(description.lithologyUncon5.code);
    primaryValues.push(description.lithologyUncon5[language]);
  }
  if (description.lithologyUncon6) {
    codes.push(description.lithologyUncon6.code);
    primaryValues.push(description.lithologyUncon6[language]);
  }
  if (description.componentUnconOrganicCodelists && description.componentUnconOrganicCodelists.length > 0) {
    primaryValues.push(...description.componentUnconOrganicCodelists.map(c => c[language]));
  }
  if (description.componentUnconDebrisCodelists && description.componentUnconDebrisCodelists.length > 0) {
    primaryValues.push(...description.componentUnconDebrisCodelists.map(c => c[language]));
  }
  if (description.colorPrimary) {
    primaryValues.push(description.colorPrimary[language]);
  }
  if (description.colorSecondary) {
    primaryValues.push(description.colorSecondary[language]);
  }

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
  const secondaryValues = [];
  if (description.lithologyUnconDebrisCodelists && description.lithologyUnconDebrisCodelists.length > 0) {
    secondaryValues.push(...description.lithologyUnconDebrisCodelists.map(c => c[language]));
  }
  if (description.grainShapeCodelists && description.grainShapeCodelists.length > 0) {
    secondaryValues.push(...description.grainShapeCodelists.map(c => c[language]));
  }
  if (description.grainAngularityCodelists && description.grainAngularityCodelists.length > 0) {
    secondaryValues.push(...description.grainAngularityCodelists.map(c => c[language]));
  }
  secondaryValues.push(t(description.hasStriae ? "striae" : "noStriae"));
  return `${t("coarseComponent", { count: secondaryValues.length })}: ${secondaryValues.join(", ")}`;
};

const buildUnconsolidatedDetails1String = (t: TFunction, language: string, lithology: Lithology) => {
  const details = [];
  if (lithology.compactness) details.push(lithology.compactness[language]);
  if (lithology.consistency) details.push(lithology.consistency[language]);
  if (lithology.cohesion) details.push(lithology.cohesion[language]);
  if (lithology.plasticity) details.push(lithology.plasticity[language]);
  if (lithology.humidity) details.push(lithology.humidity[language]);
  if (lithology.uscsTypeCodelists && lithology.uscsTypeCodelists.length > 0) {
    let uscsString = `${t("uscsClass", { count: lithology.uscsTypeCodelists.length })}: ${lithology.uscsTypeCodelists.map(c => c[language]).join(", ")}`;
    if (lithology.uscsDetermination) {
      uscsString += ` (${lithology.uscsDetermination[language]})`;
    }
    details.push(uscsString);
  }

  return details.join(", ");
};

const buildUnconsolidatedDetails2String = (language: string, lithology: Lithology) => {
  const details = [];
  if (lithology.rockConditionCodelists && lithology.rockConditionCodelists.length > 0) {
    details.push(...lithology.rockConditionCodelists.map(c => c[language]));
  }
  if (lithology.alterationDegree) details.push(lithology.alterationDegree[language]);

  return details.join(", ");
};

const buildConsolidatedPrimaryString = (
  t: TFunction,
  language: string,
  description: LithologyDescription,
  share?: number,
) => {
  const primaryValues = [];
  if (description.lithologyCon) {
    primaryValues.push(description.lithologyCon[language]);
  }
  if (description.componentConParticleCodelists && description.componentConParticleCodelists.length > 0) {
    primaryValues.push(...description.componentConParticleCodelists.map(c => c[language]));
  }
  if (description.componentConMineralCodelists && description.componentConMineralCodelists.length > 0) {
    primaryValues.push(...description.componentConMineralCodelists.map(c => c[language]));
  }
  if (description.colorPrimary) {
    primaryValues.push(description.colorPrimary[language]);
  }
  if (description.colorSecondary) {
    primaryValues.push(description.colorSecondary[language]);
  }

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
  const secondaryValues = [];
  if (description.grainSize) {
    secondaryValues.push(description.grainSize[language]);
  }
  if (description.grainAngularity) {
    secondaryValues.push(description.grainAngularity[language]);
  }
  if (description.gradation) {
    secondaryValues.push(description.gradation[language]);
  }
  if (description.cementation) {
    secondaryValues.push(description.cementation[language]);
  }
  if (description.structureSynGenCodelists && description.structureSynGenCodelists.length > 0) {
    secondaryValues.push(...description.structureSynGenCodelists.map(c => c[language]));
  }
  if (description.structurePostGenCodelists && description.structurePostGenCodelists.length > 0) {
    secondaryValues.push(...description.structurePostGenCodelists.map(c => c[language]));
  }

  return secondaryValues.join(", ");
};

const buildConsolidatedDetailsString = (language: string, lithology: Lithology) => {
  const details = [];
  if (lithology.textureMetaCodelists && lithology.textureMetaCodelists.length > 0) {
    details.push(...lithology.textureMetaCodelists.map(c => c[language]));
  }
  if (lithology.alterationDegree) details.push(lithology.alterationDegree[language]);

  return details.join(", ");
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
        {lithology.lithologyDescriptions &&
          lithology.lithologyDescriptions.map((description, index) => (
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
        {lithology.lithologyDescriptions &&
          lithology.lithologyDescriptions.map((description, index) => (
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
