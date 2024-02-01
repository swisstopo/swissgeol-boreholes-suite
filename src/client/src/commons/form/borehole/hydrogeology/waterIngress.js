import React, { useState, useEffect, useMemo, createRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography } from "@mui/material";
import { AddButton } from "../../../../components/buttons/buttons";
import {
  DataCard,
  DataCardItem,
  DataCardContainer,
  DataCardButtonContainer,
} from "../../../../components/dataCard/dataCard";
import {
  FullPage,
  FullPageCentered,
} from "../../../../components/baseComponents";

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
    <FullPage>
      <DataCardButtonContainer>
        {isEditable && (
          <AddButton
            data-cy={"add-wateringress-button"}
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
            }}>
            {t("addWaterIngress")}
          </AddButton>
        )}
      </DataCardButtonContainer>
      {displayedWaterIngresses?.length === 0 && (
        <FullPageCentered>
          <Typography variant="fullPageMessage">
            {t("msgWateringressesEmpty")}
          </Typography>
        </FullPageCentered>
      )}
      <DataCardContainer>
        {displayedWaterIngresses?.length > 0 &&
          displayedWaterIngresses
            ?.sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((waterIngress, index) => {
              const isSelected = selectedWaterIngress?.id === waterIngress.id;
              const isTempWateringress = waterIngress.id === 0;
              return (
                <DataCardItem key={index} ref={waterIngressRefs[index]}>
                  {isSuccess ? (
                    <DataCard key={waterIngress.id}>
                      {isEditable && isSelected ? (
                        <WaterIngressInput
                          waterIngress={waterIngress}
                          setSelectedWaterIngress={setSelectedWaterIngress}
                          updateWaterIngress={updateWaterIngress}
                          addWaterIngress={addWaterIngress}
                          boreholeId={boreholeId}
                        />
                      ) : (
                        !isTempWateringress && (
                          <WaterIngressDisplay
                            waterIngress={waterIngress}
                            selectedWaterIngress={selectedWaterIngress}
                            setSelectedWaterIngress={setSelectedWaterIngress}
                            isEditable={isEditable}
                            deleteWaterIngress={deleteWaterIngress}
                          />
                        )
                      )}
                    </DataCard>
                  ) : (
                    <CircularProgress />
                  )}
                </DataCardItem>
              );
            })}
      </DataCardContainer>
    </FullPage>
  );
};
export default WaterIngress;
