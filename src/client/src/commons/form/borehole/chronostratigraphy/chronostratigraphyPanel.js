import React, { useState, useEffect } from "react";
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
import TranslationText from "../../translationText";
import * as Styled from "../../profile/styles";

const ChronostratigraphyPanel = ({
  id: selectedBoreholeId,
  unlocked: isEditable,
}) => {
  const { data: chronostratigraphyQueryData } =
    useLithologyStratigraphies(selectedBoreholeId);

  const [stratigraphyId, setStratigraphyId] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    // select stratigraphy if none is selected
    if (chronostratigraphyQueryData && !stratigraphyId) {
      setStratigraphyId(
        chronostratigraphyQueryData.find(x => x.isPrimary)?.id ??
          chronostratigraphyQueryData[0]?.id ??
          "",
      );
    }
  }, [chronostratigraphyQueryData, stratigraphyId]);

  if (!chronostratigraphyQueryData) {
    return (
      <Styled.Empty>
        <CircularProgress />
      </Styled.Empty>
    );
  } else if (chronostratigraphyQueryData.length === 0) {
    return (
      <Styled.Empty data-cy="stratigraphy-message">
        <TranslationText
          id={
            isEditable
              ? "msgChronostratigraphyEmptyEditing"
              : "msgChronostratigraphyEmpty"
          }
        />
      </Styled.Empty>
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
            {s.name || t("np")}
          </MenuItem>
        ))}
      </TextField>
      <NavigationContainer
        sx={{ gap: "0.5em" }}
        renderItems={(navState, setNavState) => {
          return (
            <>
              <NavigationChild
                moveChildren={false}
                sx={{ flex: "0 0 4em" }}
                navState={navState}
                setNavState={setNavState}>
                <NavigationLens
                  navState={navState}
                  setNavState={setNavState}
                  renderBackground={(lensNavState, setLensNavState) => (
                    <LithologyViewProfile
                      navState={lensNavState}
                      setNavState={setLensNavState}
                      stratigraphyId={stratigraphyId}
                      minPixelHeightForDepthLabel={Number.MAX_VALUE}
                    />
                  )}
                />
              </NavigationChild>
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
