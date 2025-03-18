import React, { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography } from "@mui/material";
import { DetailContext } from "../../pages/detail/detailContext.tsx";
import { FieldMeasurement } from "../../pages/detail/form/hydrogeology/fieldMeasurement/FieldMeasurement.ts";
import { GroundwaterLevelMeasurement } from "../../pages/detail/form/hydrogeology/groundwaterLevelMeasurement/GroundwaterLevelMeasurement.ts";
import { Hydrotest } from "../../pages/detail/form/hydrogeology/hydrotest/Hydrotest.ts";
import { WaterIngress } from "../../pages/detail/form/hydrogeology/waterIngress/WaterIngress.ts";
import { AddButton } from "../buttons/buttons.tsx";
import { FullPage, FullPageCentered } from "../styledComponents.ts";
import { DataCard, DataCardButtonContainer, DataCardContainer, DataCardItem } from "./dataCard.js";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext.js";

interface DataCardsContainerProps {
  children: () => ReactNode;
}

const DataCardsContainer: React.FC<DataCardsContainerProps> = ({ children }) => {
  return <DataCardContainer>{children()}</DataCardContainer>;
};
export const MemoizedDataCardsContainer = React.memo(DataCardsContainer);

interface TempDatacardEntity {
  id: number;
}

export type DataCardEntity =
  | Hydrotest
  | WaterIngress
  | GroundwaterLevelMeasurement
  | FieldMeasurement
  | TempDatacardEntity;

interface DataCardsProps<T extends DataCardEntity> {
  parentId: number;
  getData: (parentId: number) => Promise<T[]>;
  cyLabel: string;
  addLabel: string;
  emptyLabel: string;
  renderInput: (props: { item: T; parentId: number }) => ReactNode;
  renderDisplay: (props: { item: T; editingEnabled: boolean }) => ReactNode;
  sortDisplayed: (a: T, b: T) => number;
}

/**
 * DataCards Component
 * The parent component must use display: flex, otherwise the DataCards may not be visible.
 */
export const DataCards = <T extends DataCardEntity>({
  parentId,
  getData,
  cyLabel,
  addLabel,
  emptyLabel,
  renderInput,
  renderDisplay,
  sortDisplayed,
}: DataCardsProps<T>) => {
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { displayedCards, selectedCard, addCard, selectCard, shouldReload, setLoadedCards } =
    useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);
  const { editingEnabled } = useContext(DetailContext);

  const loadData = () => {
    setIsLoadingData(true);
    if (parentId && mounted.current) {
      getData(parentId).then(response => {
        const cards = response?.length > 0 ? response : [];
        setLoadedCards(cards);
        setIsLoadingData(false);
      });
    } else if (parentId === null) {
      setLoadedCards([]);
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!editingEnabled) {
      selectCard(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEnabled]);

  useEffect(() => {
    mounted.current = true;
    loadData();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  useEffect(() => {
    if (shouldReload) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReload]);

  const renderCards = useCallback(() => {
    return (displayedCards as T[]).sort(sortDisplayed).map((item, index) => {
      const isSelected = selectedCard?.id === item.id;
      const isTemp = item.id === 0;
      let cardLabel = `${cyLabel}-card.${index}`;
      if (editingEnabled && isSelected) {
        cardLabel = `${cyLabel}-card.${index}.edit`;
      }
      return (
        <DataCardItem key={index}>
          <DataCard key={index} data-cy={cardLabel}>
            {editingEnabled && isSelected
              ? renderInput({
                  item: item,
                  parentId: parentId,
                })
              : !isTemp &&
                renderDisplay({
                  item: item,
                  editingEnabled: editingEnabled,
                })}
          </DataCard>
        </DataCardItem>
      );
    });
  }, [editingEnabled, parentId, renderInput, renderDisplay, sortDisplayed, cyLabel, displayedCards, selectedCard]);

  return (
    <FullPage data-cy={`${cyLabel}-content`}>
      <DataCardButtonContainer mr={1}>
        {editingEnabled && (
          <AddButton
            label={addLabel}
            disabled={selectedCard?.id === 0}
            onClick={() => {
              const tempCard: TempDatacardEntity = { id: 0 };
              if (!selectedCard) {
                addCard(tempCard);
              } else {
                switchToCard(tempCard);
              }
            }}
          />
        )}
      </DataCardButtonContainer>
      {isLoadingData ? (
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      ) : displayedCards?.length > 0 ? (
        // eslint-disable-next-line react/no-children-prop
        <MemoizedDataCardsContainer children={renderCards} />
      ) : (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t(emptyLabel)}</Typography>
        </FullPageCentered>
      )}
    </FullPage>
  );
};

export default DataCards;
