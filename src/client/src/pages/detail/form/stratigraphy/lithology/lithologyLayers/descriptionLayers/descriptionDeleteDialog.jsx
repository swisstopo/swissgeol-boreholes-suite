import { Box, Stack, Typography } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useTranslation } from "react-i18next";
import { CancelButton, DeleteButton } from "../../../../../../../components/buttons/buttons.tsx";
import { theme } from "../../../../../../../AppTheme.ts";

const DescriptionDeleteDialog = props => {
  const { item, setDescriptionIdSelectedForDelete, deleteMutation } = props;
  const { t } = useTranslation();

  return (
    <Stack
      onClick={e => {
        e.stopPropagation();
      }}
      alignItems="flex-start"
      sx={{ width: "100%", color: theme.palette.error.main }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <WarningIcon />
        <Typography sx={{ fontWeight: "bold" }}>{t("errorAttention")}</Typography>{" "}
      </Stack>
      <Typography sx={{ color: theme.palette.error.main }} variant="subtitle2">
        {t("deletelayerconfirmation")}
      </Typography>
      <Box
        data-cy="description-button-box"
        alignSelf="flex-end"
        sx={{ marginTop: "auto", marginRight: "0.5em", marginBottom: "0.5em" }}>
        <CancelButton
          onClick={e => {
            e.stopPropagation();
            setDescriptionIdSelectedForDelete(0);
          }}
        />
        <DeleteButton
          label="delete"
          onClick={e => {
            e.stopPropagation();
            deleteMutation.mutate(item.id);
          }}
        />
      </Box>
    </Stack>
  );
};
export default DescriptionDeleteDialog;
