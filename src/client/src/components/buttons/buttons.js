import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";

export const BaseButton = styled(Button)({
  fontFamily: "Lato",
  textTransform: "none",
  color: "rgba(0, 0, 0, 0.8)",
  borderColor: "rgba(0, 0, 0, 0.8)",
  marginBottom: "6px",
  "&:hover, &.Mui-focusVisible, &:active, &:focus, &:focus-visible": {
    borderColor: "rgba(0, 0, 0, 0.8)",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
});

export const AddButton = forwardRef((props, ref) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("add")}>
      <BaseButton
        ref={ref}
        {...props}
        variant="outlined"
        startIcon={<AddIcon />}>
        {props.children}
      </BaseButton>
    </Tooltip>
  );
});
