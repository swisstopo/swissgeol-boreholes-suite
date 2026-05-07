import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Workgroup } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { FilterAdaptiveSelect } from "./FilterAdaptiveSelect.tsx";
import { SearchData } from "./filterData/filterInterfaces.ts";

interface WorkgroupFilterProps {
  selectedWorkgroupIds?: number[];
  onChange: (value: number[] | null) => void;
  workgroups: Workgroup[];
  counts?: Record<number, number>;
}

const item: SearchData = { key: "workgroupId" };

export const WorkgroupFilter: FC<WorkgroupFilterProps> = ({ selectedWorkgroupIds, onChange, workgroups, counts }) => {
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      workgroups
        .map(w => ({
          key: w.id,
          label: w.workgroup + (w.disabled === null ? "" : " ( " + t("disabled") + ")"),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [workgroups, t],
  );

  return (
    <FilterAdaptiveSelect<number>
      item={item}
      options={options}
      filterValue={selectedWorkgroupIds}
      onUpdate={value => onChange(value ?? null)}
      counts={counts}
    />
  );
};
