import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";

export const ButtonColor = {
  default: "rgba(0, 0, 0, 0.8)",
  success: "rgba(0, 128, 0, 0.8)",
  error: "rgba(255, 0, 0, 0.8)",
};

export const BaseButton = styled(Button)({
  fontFamily: "Lato",
  textTransform: "none",
  color: ButtonColor.default,
  borderColor: ButtonColor.default,
  marginBottom: "6px",
  "&:hover, &.Mui-focusVisible, &:active, &:focus, &:focus-visible": {
    borderColor: ButtonColor.default,
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

export const BaseIconButton = styled(IconButton)({
  color: ButtonColor.default,
  "&:hover, &.Mui-focusVisible, &:active, &:focus, &:focus-visible": {
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
});

export const IconButtonWithMargin = styled(BaseIconButton)({
  marginLeft: "5px",
});

export const BdmsIconButton = ({
  icon,
  tooltipLabel,
  color,
  disabled,
  onClick,
}) => {
  const { t } = useTranslation();
  var colorToUse = color ? color : ButtonColor.default;
  return (
    <Tooltip title={t(tooltipLabel)}>
      <span>
        <BaseIconButton
          data-cy={tooltipLabel + "-button"}
          sx={{ color: colorToUse }}
          disabled={disabled}
          onClick={onClick}>
          {icon}
        </BaseIconButton>
      </span>
    </Tooltip>
  );
};
