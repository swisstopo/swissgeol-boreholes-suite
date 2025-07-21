import { useTranslation } from "react-i18next";
import { Box, Button, Stack } from "@mui/material";
import { useBoreholeMutations } from "../../../api/borehole.ts";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import { SideDrawerHeader } from "../layout/sideDrawerHeader.tsx";
import { NewBoreholeProps } from "./commons/actionsInterfaces.ts";
import WorkgroupSelect from "./commons/workgroupSelect.tsx";

const NewBoreholePanel = ({ workgroupId, enabledWorkgroups, setWorkgroupId, toggleDrawer }: NewBoreholeProps) => {
  const { navigateTo } = useBoreholesNavigate();
  const {
    add: { mutateAsync: addBoreholeAsync },
  } = useBoreholeMutations();
  const { t } = useTranslation();

  const handleBoreholeCreate = async () => {
    if (workgroupId) {
      const borehole = await addBoreholeAsync(workgroupId);
      navigateTo({ path: "/" + borehole.id });
    }
  };

  return (
    <Stack direction="column" height={"100%"}>
      <SideDrawerHeader title={t("newBorehole")} toggleDrawer={toggleDrawer} />
      <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable" }}>
        <WorkgroupSelect
          workgroupId={workgroupId}
          enabledWorkgroups={enabledWorkgroups}
          setWorkgroupId={setWorkgroupId}
        />
      </Box>
      <Button
        variant="contained"
        data-cy={"create-button"}
        disabled={enabledWorkgroups?.length === 0}
        onClick={handleBoreholeCreate}>
        {t("create")}
      </Button>
    </Stack>
  );
};

export default NewBoreholePanel;
