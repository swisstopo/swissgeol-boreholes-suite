import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, MenuItem, Stack, TextField } from "@mui/material";
import { useLithologyStratigraphies } from "../../../../api/fetchApiV2.ts";
import { theme } from "../../../../AppTheme";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import * as Styled from "./lithology/styles.js";

/**
 * Provides a stratigraphy selection. The selected stratigraphy is available through the `renderItem` render prop.
 */
const StratigraphySelection = ({ id: selectedBoreholeId, noStratigraphiesMessageKey, renderItem }) => {
  const { data: stratigraphyData } = useLithologyStratigraphies(selectedBoreholeId);

  const [stratigraphyId, setStratigraphyId] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    // select stratigraphy if none is selected
    if (stratigraphyData && !stratigraphyId) {
      setStratigraphyId(stratigraphyData.find(x => x.isPrimary)?.id ?? stratigraphyData[0]?.id ?? "");
    }
  }, [stratigraphyData, stratigraphyId]);

  if (!stratigraphyData) {
    return (
      <Styled.Empty>
        <CircularProgress />
      </Styled.Empty>
    );
  } else if (stratigraphyData.length === 0) {
    return (
      <Styled.Empty data-cy="stratigraphy-message">
        <TranslationText id={noStratigraphiesMessageKey} />
      </Styled.Empty>
    );
  }

  return (
    <Stack
      direction="column"
      sx={{
        flex: "1",
        p: 3,
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.border.light}`,
      }}>
      <TextField
        value={stratigraphyId}
        label={t("stratigraphy")}
        select
        onChange={event => {
          setStratigraphyId(event.target.value);
        }}
        sx={{ flex: "0 1 auto" }}>
        {stratigraphyData.map(s => (
          <MenuItem key={s.id} value={s.id}>
            {s.name || t("np")}
          </MenuItem>
        ))}
      </TextField>
      {renderItem(stratigraphyId)}
    </Stack>
  );
};

export default StratigraphySelection;
