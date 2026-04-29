import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { NullableBooleanCounts } from "../../../../api/borehole.ts";
import { SearchData } from "./filterData/filterInterfaces";

interface FilterBooleanButtonsProps {
  item: SearchData;
  filterValue: boolean | null | undefined;
  onUpdate: (value: boolean | null | undefined) => void;
  allowNull: boolean;
  counts?: NullableBooleanCounts;
}

type OptionDef = {
  key: "yes" | "no" | "np";
  value: boolean | null;
  labelKey: string;
  countKey: keyof NullableBooleanCounts;
};

const optionsFor = (allowNull: boolean): OptionDef[] => {
  const base: OptionDef[] = [
    { key: "yes", value: true, labelKey: "yes", countKey: "true" },
    { key: "no", value: false, labelKey: "no", countKey: "false" },
  ];
  return allowNull ? [...base, { key: "np", value: null, labelKey: "np", countKey: "null" }] : base;
};

export const FilterBooleanButtons: FC<FilterBooleanButtonsProps> = ({
  item,
  filterValue,
  onUpdate,
  allowNull,
  counts,
}) => {
  const { t } = useTranslation();
  const options = optionsFor(allowNull);

  const toggle = (value: boolean | null) => {
    if (filterValue === value) {
      onUpdate(undefined);
    } else {
      onUpdate(value);
    }
  };

  return (
    <Box data-cy={`${item.key}-formSelect`}>
      {item.label ? (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {t(item.label)}
        </Typography>
      ) : null}

      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {options.map(opt => {
          const isSelected = filterValue === opt.value;
          const count = counts?.[opt.countKey] ?? 0;
          const hasCount = counts !== undefined;
          // Disable when count information is available and there would be zero matches,
          // unless the option is already selected (so the user can always clear).
          const disabled = hasCount && !isSelected && count < 1;
          const label = hasCount ? `${t(opt.labelKey)} (${count})` : t(opt.labelKey);
          return (
            <Button
              key={opt.key}
              size="small"
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              sx={{ textTransform: "none" }}
              data-cy={`${item.key}-button-${opt.key}`}>
              {label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};
