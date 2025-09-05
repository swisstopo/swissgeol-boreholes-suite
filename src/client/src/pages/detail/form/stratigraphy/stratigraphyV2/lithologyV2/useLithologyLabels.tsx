import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import type { TFunction } from "i18next";
import { Lithology, LithologyDescription } from "../../lithology";

const getBeddingShare = (lithology: Lithology, index: number) => {
  return lithology.hasBedding && lithology.share ? (index === 0 ? lithology.share : 100 - lithology.share) : undefined;
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
  if (description.componentUnconOrganicCodelists.length > 0) {
    primaryValues.push(...description.componentUnconOrganicCodelists.map(c => c[language]));
  }
  if (description.componentUnconDebrisCodelists.length > 0) {
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
  if (description.lithologyUnconDebrisCodelists.length > 0) {
    secondaryValues.push(...description.lithologyUnconDebrisCodelists.map(c => c[language]));
  }
  if (description.grainShapeCodelists.length > 0) {
    secondaryValues.push(...description.grainShapeCodelists.map(c => c[language]));
  }
  if (description.grainAngularityCodelists.length > 0) {
    secondaryValues.push(...description.grainAngularityCodelists.map(c => c[language]));
  }
  secondaryValues.push(t(description.hasStriae ? "striae" : "noStriae"));
  return `${t("coarseComponent", { count: secondaryValues.length })}: ${secondaryValues.join(", ")}`;
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
  if (description.componentConParticleCodelists.length > 0) {
    primaryValues.push(...description.componentConParticleCodelists.map(c => c[language]));
  }
  if (description.componentConMineralCodelists.length > 0) {
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
  if (description.structureSynGenCodelists.length > 0) {
    secondaryValues.push(...description.structureSynGenCodelists.map(c => c[language]));
  }
  if (description.structurePostGenCodelists.length > 0) {
    secondaryValues.push(...description.structurePostGenCodelists.map(c => c[language]));
  }

  return secondaryValues.join(", ");
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

export const useLithologyLabels = () => {
  const { t, i18n } = useTranslation();

  const buildLithologyLabels = (lithology: Lithology) => {
    const language = i18n.language;
    if (lithology.isUnconsolidated) {
      const details1 = [];
      if (lithology.compactness) details1.push(lithology.compactness[language]);
      if (lithology.consistency) details1.push(lithology.consistency[language]);
      if (lithology.cohesion) details1.push(lithology.cohesion[language]);
      if (lithology.plasticity) details1.push(lithology.plasticity[language]);
      if (lithology.humidity) details1.push(lithology.humidity[language]);
      if (lithology.uscsTypeCodelists.length > 0) {
        let uscsString = `${t("uscsClass", { count: lithology.uscsTypeCodelists.length })}: ${lithology.uscsTypeCodelists.map(c => c[language]).join(", ")}`;
        if (lithology.uscsDetermination) {
          uscsString += ` (${lithology.uscsDetermination[language]})`;
        }
        details1.push(uscsString);
      }

      const details2 = [];
      if (lithology.rockConditionCodelists.length > 0) {
        details2.push(...lithology.rockConditionCodelists.map(c => c[language]));
      }
      if (lithology.alterationDegree) details2.push(lithology.alterationDegree[language]);

      return (
        <>
          {lithology.lithologyDescriptions.map((description, index) =>
            buildUnconsolidatedLithologyDescription(t, language, description, getBeddingShare(lithology, index)),
          )}
          {details1.length > 0 && <Typography variant="body2">{details1.join(", ")}</Typography>}
          {details2.length > 0 && <Typography variant="body2">{details2.join(", ")}</Typography>}
          {lithology.notes && <Typography variant="body2">{lithology.notes}</Typography>}
        </>
      );
    } else {
      const details = [];
      if (lithology.textureMataCodelists.length > 0) {
        details.push(...lithology.textureMataCodelists.map(c => c[language]));
      }
      if (lithology.alterationDegree) details.push(lithology.alterationDegree[language]);

      return (
        <>
          {lithology.lithologyDescriptions.map((description, index) =>
            buildConsolidatedLithologyDescription(t, language, description, getBeddingShare(lithology, index)),
          )}
          {details.length > 0 && <Typography variant="body2">{details.join(", ")}</Typography>}
          {lithology.notes && <Typography variant="body2">{lithology.notes}</Typography>}
        </>
      );
    }
  };

  return { buildLithologyLabels };
};
