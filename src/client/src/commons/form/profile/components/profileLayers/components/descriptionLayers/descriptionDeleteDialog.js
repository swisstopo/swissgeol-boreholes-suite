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
      onClick={e => {
        e.stopPropagation();
      }}
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
      <Box
        alignSelf="flex-end"
        sx={{ marginTop: "auto", marginRight: "0.5em", marginBottom: "0.5em" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={e => {
            e.stopPropagation();
            setDescriptionIdSelectedForDelete(0);
          }}>
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          size="small"
          color="error"
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
