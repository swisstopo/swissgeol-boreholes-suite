import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Stack, Typography } from "@mui/material";
import { ReturnButton } from "../../components/buttons/buttons.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { capitalizeFirstLetter } from "../../utils.ts";

export const DetailHeaderSettings = () => {
  const history = useHistory();
  const { t } = useTranslation();

  return (
    <DetailHeaderStack direction="row" alignItems="center">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"}>
        <ReturnButton
          onClick={() => {
            history.push("/");
          }}
        />
        <Typography variant="h2"> {capitalizeFirstLetter(t("settings"))}</Typography>
      </Stack>
    </DetailHeaderStack>
  );
};
