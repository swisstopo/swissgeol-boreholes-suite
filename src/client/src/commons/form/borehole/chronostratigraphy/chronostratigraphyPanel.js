import React, { useState } from "react";
import {
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLithologyStratigraphies } from "../../../../api/fetchApiV2";
import NavigationContainer from "./navigationContainer";
import NavigationLens from "./navigationLens";
import LithologyViewProfile from "./lithologyViewProfile";
import ChronostratigraphyEditProfile from "./chronostratigraphyEditProfile";
import NavigationChild from "./navigationChild";

const ChronostratigraphyPanel = ({
  id: selectedBoreholeId,
  unlocked: isEditable,
}) => {
  const { data: chronostratigraphyQueryData } =
    useLithologyStratigraphies(selectedBoreholeId);

  const [stratigraphyId, setStratigraphyId] = useState("");

  const { t } = useTranslation();

  if (!chronostratigraphyQueryData) {
    return <CircularProgress />;
  }

  if (!stratigraphyId) {
    setStratigraphyId(
      chronostratigraphyQueryData.find(x => x.isPrimary)?.id ??
        chronostratigraphyQueryData[0]?.id ??
        "",
    );
  }

  return (
    <Stack direction="column" sx={{ flex: "1" }}>
      <TextField
        value={stratigraphyId}
        label={t("stratigraphy")}
        select
        onChange={(event, value) => {
          setStratigraphyId(event.target.value);
        }}
        sx={{ margin: "1em 0" }}>
        {chronostratigraphyQueryData.map(s => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </TextField>
      <NavigationContainer
        sx={{ gap: "0.5em" }}
        renderItems={(navState, setNavState) => {
          return (
            <>
              <NavigationLens
                navState={navState}
                setNavState={setNavState}
                sx={{ flex: "0 0 4em" }}
                renderBackground={(lensNavState, setLensNavState) => (
                  <LithologyViewProfile
                    navState={lensNavState}
                    setNavState={setLensNavState}
                    stratigraphyId={stratigraphyId}
                    minPixelHeightForDepthLabel={Number.MAX_VALUE}
                  />
                )}
              />
              <NavigationChild
                sx={{ flex: "0 0 8em" }}
                navState={navState}
                setNavState={setNavState}
                header={<Typography>{t("lithology")}</Typography>}>
                <LithologyViewProfile
                  stratigraphyId={stratigraphyId}
                  navState={navState}
                  setNavState={setNavState}
                />
              </NavigationChild>
              <ChronostratigraphyEditProfile
                selectedStratigraphyID={stratigraphyId}
                isEditable={isEditable}
                navState={navState}
                setNavState={setNavState}
              />
            </>
          );
        }}
      />
    </Stack>
  );
};

export default ChronostratigraphyPanel;
