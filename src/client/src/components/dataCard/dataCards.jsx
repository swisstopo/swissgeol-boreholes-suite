import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography } from "@mui/material";
import { DataCard, DataCardItem, DataCardContainer, DataCardButtonContainer } from "./dataCard";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext";
import { AddButton } from "../buttons/buttons";
import { FullPage, FullPageCentered } from "../baseComponents";

const DataCardsContainer = props => {
  return <DataCardContainer>{props.children()}</DataCardContainer>;
};
export const MemoizedDataCardsContainer = React.memo(DataCardsContainer);

export const DataCards = props => {
  const { isEditable, parentId, getData, cyLabel, addLabel, emptyLabel, renderInput, renderDisplay, sortDisplayed } =
    props;
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { displayedCards, selectedCard, addCard, shouldReload, setLoadedCards } = useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);

  const loadData = () => {
    setIsLoadingData(true);
    if (parentId && mounted.current) {
      getData(parentId).then(response => {
        var cards = response?.length > 0 ? response : [];
        setLoadedCards(cards);
        setIsLoadingData(false);
      });
    } else if (parentId === null) {
      setLoadedCards([]);
      setIsLoadingData(false);
    }
  };

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
    return displayedCards.sort(sortDisplayed).map((item, index) => {
      const isSelected = selectedCard?.id === item.id;
      const isTemp = item.id === 0;
      return (
        <DataCardItem key={item.id}>
          <DataCard key={item.id} data-cy={`${cyLabel}-card.${index}`}>
            {isEditable && isSelected
              ? renderInput({
                  item: item,
                  parentId: parentId,
                })
              : !isTemp &&
                renderDisplay({
                  item: item,
                  isEditable: isEditable,
                })}
          </DataCard>
        </DataCardItem>
      );
    });
  }, [isEditable, parentId, renderInput, renderDisplay, sortDisplayed, cyLabel, displayedCards, selectedCard]);

  return (
    <FullPage data-cy={`${cyLabel}-content`}>
      <DataCardButtonContainer>
        {isEditable && (
          <AddButton
            label={addLabel}
            onClick={() => {
              const tempCard = { id: 0 };
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
