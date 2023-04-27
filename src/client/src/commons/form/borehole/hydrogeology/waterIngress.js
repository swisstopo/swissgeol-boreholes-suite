import React, { useState, useEffect, useMemo, createRef } from "react";
import { useTranslation } from "react-i18next";
import {
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import {
  useWaterIngressMutations,
  useWaterIngresses,
} from "../../../../api/fetchApiV2";
import WaterIngressInput from "./waterIngressInput";
import WaterIngressDisplay from "./waterIngressDisplay";

const WaterIngress = props => {
  const { isEditable, boreholeId } = props;
  const { data: waterIngresses, isSuccess } = useWaterIngresses(boreholeId);
  const { t } = useTranslation();
  const {
    add: { mutate: addWaterIngress },
    update: { mutate: updateWaterIngress },
    delete: { mutate: deleteWaterIngress },
  } = useWaterIngressMutations();
  const [selectedWaterIngress, setSelectedWaterIngress] = useState(null);
  const [displayedWaterIngresses, setDisplayedWaterIngresses] = useState([]);

  useEffect(() => {
    setDisplayedWaterIngresses(waterIngresses);
  }, [waterIngresses]);

  // scroll to newly added item
  const waterIngressRefs = useMemo(
    () =>
      Array(displayedWaterIngresses?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayedWaterIngresses],
  );

  useEffect(() => {
    if (displayedWaterIngresses?.length > 0) {
      const lastWaterIngressRef =
        waterIngressRefs[displayedWaterIngresses?.length - 1];
      if (displayedWaterIngresses[displayedWaterIngresses?.length - 1].id === 0)
        lastWaterIngressRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayedWaterIngresses, waterIngressRefs]);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Stack direction="row" sx={{ mb: 2 }}>
        <Typography sx={{ mr: 1 }}>{t("water_ingress")}</Typography>
        {isEditable && (
          <Tooltip title={t("add")}>
            <AddCircleIcon
              data-cy="add-wateringress-button"
              color={selectedWaterIngress === null ? "black" : "disabled"}
              onClick={e => {
                e.stopPropagation();
                if (selectedWaterIngress === null) {
                  const tempWaterIngress = { id: 0 };
                  setDisplayedWaterIngresses([
                    ...waterIngresses,
                    tempWaterIngress,
                  ]);
                  setSelectedWaterIngress(tempWaterIngress);
                }
              }}
            />
          </Tooltip>
        )}
      </Stack>
      {displayedWaterIngresses?.length === 0 && (
        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Typography variant="fullPageMessage">
            {t("msgWateringressesEmpty")}
          </Typography>
        </Stack>
      )}
      <Grid
        container
        alignItems="stretch"
        columnSpacing={{ xs: 2 }}
        rowSpacing={{ xs: 2 }}
        sx={{ overflow: "auto", maxHeight: "85vh" }}>
        {displayedWaterIngresses?.length > 0 &&
          displayedWaterIngresses
            ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((waterIngress, index) => (
              <Grid
                item
                md={12}
                lg={12}
                xl={6}
                key={index}
                ref={waterIngressRefs[index]}>
                {isSuccess ? (
                  selectedWaterIngress?.id !== waterIngress.id ? (
                    <WaterIngressDisplay
                      waterIngress={waterIngress}
                      selectedWaterIngress={selectedWaterIngress}
                      setSelectedWaterIngress={setSelectedWaterIngress}
                      isEditable={isEditable}
                      deleteWaterIngress={deleteWaterIngress}
                    />
                  ) : (
                    <WaterIngressInput
                      waterIngress={waterIngress}
                      setSelectedWaterIngress={setSelectedWaterIngress}
                      updateWaterIngress={updateWaterIngress}
                      addWaterIngress={addWaterIngress}
                      boreholeId={boreholeId}
                    />
                  )
                ) : (
                  <CircularProgress />
                )}
              </Grid>
            ))}
      </Grid>
    </Stack>
  );
};
export default WaterIngress;
