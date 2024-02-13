import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";

export const AddButton = forwardRef((props, ref) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("add")}>
      <Button ref={ref} {...props} variant="outlined" startIcon={<AddIcon />}>
        {props.children}
      </Button>
    </Tooltip>
  );
});

export const IconButtonWithMargin = styled(IconButton)({
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
  var colorToUse = color ? color : "primary";
  return (
    <Tooltip title={t(tooltipLabel)}>
      <span>
        <IconButton
          data-cy={tooltipLabel + "-button"}
          color={colorToUse}
          disabled={disabled}
          onClick={onClick}>
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};
