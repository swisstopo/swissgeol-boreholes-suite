import { useTranslation } from "react-i18next";
import { Button, Stack } from "@mui/material";
import { SideDrawerHeader } from "../layout/sideDrawerHeader.tsx";
import { NewBoreholeProps } from "./commons/actionsInterfaces.ts";
import WorkgroupSelect from "./commons/workgroupSelect.tsx";

const ImportPanel = ({ workgroupId, enabledWorkgroups, setWorkgroupId, toggleDrawer }: NewBoreholeProps) => {
  const { t } = useTranslation();
  const handleBoreholeImport = () => {
    console.log("import");
  };

  return (
    <>
      <SideDrawerHeader title={t("import")} toggleDrawer={toggleDrawer} />
      <Stack direction="column" spacing={3}>
        <WorkgroupSelect
          workgroupId={workgroupId}
          enabledWorkgroups={enabledWorkgroups}
          setWorkgroupId={setWorkgroupId}
        />
        <Button
          variant="outlined"
          data-cy={"import-button"}
          disabled={enabledWorkgroups?.length === 0}
          onClick={handleBoreholeImport}>
          {t("import")}
        </Button>
      </Stack>
    </>
  );
};

export default ImportPanel;
