import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography } from "@mui/material";
import { DetailContext } from "../../pages/detail/detailContext.tsx";
import { AddButton } from "../buttons/buttons.tsx";
import { FullPage, FullPageCentered } from "../styledComponents.ts";
import { DataCard, DataCardButtonContainer, DataCardContainer, DataCardItem } from "./dataCard";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext";

const DataCardsContainer = props => {
  return <DataCardContainer>{props.children()}</DataCardContainer>;
};
export const MemoizedDataCardsContainer = React.memo(DataCardsContainer);

/**
 * DataCards Component
 *
 * The parent component must use display: flex, otherwise the DataCards may not be visible.
 *
 * @param {Object} props - The properties that define the component.
 * @param {string|number} props.parentId - The ID of the parent entity.
 * @param {Function} props.getData - A function to fetch data based on the parentId.
 * @param {string} props.cyLabel - The label used for Cypress testing.
 * @param {string} props.addLabel - The label for the "Add" button.
 * @param {string} props.emptyLabel - The label displayed when there are no data cards.
 * @param {Function} props.renderInput - A function to render the input form when a card is in edit mode.
 * @param {Function} props.renderDisplay - A function to render the display view of a card.
 * @param {Function} props.sortDisplayed - A function to sort the displayed cards.
 *
 * @returns {JSX.Element} The DataCards component.
 */
export const DataCards = props => {
  const { parentId, getData, cyLabel, addLabel, emptyLabel, renderInput, renderDisplay, sortDisplayed } = props;
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
    return displayedCards.sort(sortDisplayed).map((item, index) => {
      const isSelected = selectedCard?.id === item.id;
      const isTemp = item.id === 0;
      var cardLabel = `${cyLabel}-card.${index}`;
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
