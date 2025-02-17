import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { GridEventListener } from "@mui/x-data-grid";
import { User, Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups } from "../../../api/workgroup.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { WorkgroupTable } from "./workgroupTable.tsx";

interface WorkgroupAdministrationProps {
  users: User[];
  setSelectedWorkgroup: (workgroup: Workgroup | null) => void;
  workgroups: Workgroup[] | null;
  setWorkgroups: (workgroups: Workgroup[]) => void;
}

export const WorkgroupAdministration: FC<WorkgroupAdministrationProps> = ({
  users,
  workgroups,
  setWorkgroups,
  setSelectedWorkgroup,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const { callApiWithErrorHandling } = useApiRequest();

  useEffect(() => {
    setIsLoading(true);
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      setWorkgroups(workgroups);
      setSelectedWorkgroup(null);
      setIsLoading(false);
    };
    getWorkgroups();
  }, [callApiWithErrorHandling, setSelectedWorkgroup, t]);

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/setting/workgroup/${params.row.id}`);
  };

  return (
    <WorkgroupTable
      isDisabled={false}
      workgroups={workgroups ?? []}
      users={users}
      setWorkgroups={setWorkgroups}
      isLoading={isLoading}
      handleRowClick={handleRowClick}
      selectedWorkgroup={null}
      setSelectedWorkgroup={setSelectedWorkgroup}
    />
  );
};
