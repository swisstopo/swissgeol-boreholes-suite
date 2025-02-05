import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Chip, Stack, Typography } from "@mui/material";
import { ReturnButton } from "../../components/buttons/buttons.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { capitalizeFirstLetter } from "../../utils.ts";
import { SettingsHeaderContext } from "../settings/admin/settingsHeaderContext.tsx";

export const SettingsHeader = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { title, chipContent } = useContext(SettingsHeaderContext);
  return (
    <DetailHeaderStack direction="row" alignItems="center">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={1}>
        <ReturnButton
          onClick={() => {
            title === "settings" ? history.push("/") : history.push("/setting");
          }}
        />
        <Typography variant="h2"> {capitalizeFirstLetter(t(title))}</Typography>
        {chipContent && <Chip color={"secondary"} label={t(chipContent)} />}
      </Stack>
    </DetailHeaderStack>
  );
};
