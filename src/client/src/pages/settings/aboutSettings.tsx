import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";

interface LicenseEntry {
  name: string;
  version?: string;
  repository?: string;
  description?: string;
  copyright?: string;
  licenses?: string;
  licenseText?: string;
}

type LicenseData = Record<string, LicenseEntry>;

export const AboutSettings: React.FC = () => {
  const { t } = useTranslation();
  const [license, setLicense] = useState<LicenseData>({});

  useEffect(() => {
    const fetchLicense = async () => {
      const response = await fetch("/license.json");
      const data = await response.json();
      setLicense(data);
    };
    fetchLicense();
  }, []);

  return (
    <Box style={{ padding: "2em", flex: 1 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t("about")}
      </Typography>
      <Box>
        <Typography variant="body1">
          <span style={{ fontWeight: "bold" }}>{t("sourceCode")}:&nbsp; </span>
          <a href="https://github.com/swisstopo/swissgeol-boreholes-suite" rel="noopener noreferrer" target="_BLANK">
            github.com/swisstopo/swissgeol-boreholes-suite
          </a>
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">
          <span style={{ fontWeight: "bold" }}>{t("version")}:&nbsp; </span>
          <a
            href={`https://github.com/swisstopo/swissgeol-boreholes-suite/releases/tag/v${
              import.meta.env.VITE_APP_VERSION.split("+")[0]
            }`}
            rel="noopener noreferrer"
            target="_BLANK"
            data-cy="version">
            {import.meta.env.VITE_APP_VERSION}
          </a>
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">
          <span style={{ fontWeight: "bold" }}>{t("license")}:&nbsp; </span>
          <a
            href="https://github.com/swisstopo/swissgeol-boreholes-suite/blob/main/LICENSE"
            rel="noopener noreferrer"
            target="_BLANK">
            MIT
          </a>
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ my: 2 }}>
        {t("common:licenseInformation")}
      </Typography>
      {Object.keys(license).map(key => (
        <Box key={key} data-cy={`credits-${key}`}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }} variant={"body1"}>
            {license[key].name}
            {license[key].version && ` (Version ${license[key].version})`}{" "}
          </Typography>
          <a href={license[key].repository}>{license[key].repository}</a>
          <Box>{license[key].description}</Box>
          <Box>{license[key].copyright}</Box>
          <Box>License: {license[key].licenses}</Box>
          <Box>{license[key].licenseText}</Box>
        </Box>
      ))}
    </Box>
  );
};
