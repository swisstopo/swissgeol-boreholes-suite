import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

const DescriptionDeleteDialog = props => {
  const { item, setDescriptionIdSelectedForDelete, deleteMutation } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack
      alignItems="flex-start"
      sx={{ width: "100%", color: theme.palette.error.main }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <WarningIcon />
        <Typography sx={{ fontWeight: "bold" }}>
          {t("errorAttention")}
        </Typography>{" "}
      </Stack>
      <Typography sx={{ color: theme.palette.error.main }} variant="subtitle2">
        {t("deletelayerconfirmation")}
      </Typography>
      <Box alignSelf="flex-end" sx={{ marginTop: "auto" }}>
        <Button
          variant="cancel"
          size="small"
          startIcon={<ClearIcon />}
          onClick={() => setDescriptionIdSelectedForDelete(null)}>
          {t("cancel")}
        </Button>
        <Button
          variant="delete"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={e => {
            e.stopPropagation();
            deleteMutation.mutate(item.id);
          }}>
          {t("confirm")}
        </Button>
      </Box>
    </Stack>
  );
};
export default DescriptionDeleteDialog;
