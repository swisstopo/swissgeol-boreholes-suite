import { createContext, useState } from "react";
export const DataCardContext = createContext({
  cards: [],
  displayedCards: [],
  selectedCard: null,
  shouldReload: false,
  setLoadedCards: () => {},
  triggerReload: () => {},
  addCard: () => {},
  selectCard: () => {},
});

export const DataCardSwitchContext = createContext({
  newCardIndex: null,
  checkIsDirty: false,
  switchToCard: () => {},
  leaveInput: () => {},
});

export const DataCardProvider = props => {
  const [cards, setCards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);
  const [checkIsDirty, setCheckIsDirty] = useState(false);
  const [newCardId, setNewCardId] = useState(null);

  const tempCard = { id: 0 };

  const setLoadedCards = loadedCards => {
    setShouldReload(false);
    setCards(loadedCards);

    if (newCardId !== null) {
      leaveInput(true, loadedCards);
    } else {
      setDisplayedCards(loadedCards);
      setSelectedCard(null);
    }
  };

  const addCard = card => {
    setDisplayedCards([card, ...displayedCards]);
    setSelectedCard(card);
  };

  const selectCard = card => {
    if (card === null) {
      setDisplayedCards(cards);
    }
    setSelectedCard(card);
  };

  const triggerReload = () => {
    setShouldReload(true);
  };

  const switchToCard = card => {
    setNewCardId(card.id);
    setCheckIsDirty(true);
  };

  const leaveInput = (canLeave, newCards) => {
    if (canLeave) {
      var newDisplayedCards = newCards ? newCards : cards;
      if (newCardId === 0) {
        newDisplayedCards = [tempCard, ...newDisplayedCards];
      }
      var newSelectedCard = newDisplayedCards.find(c => c.id === newCardId) || null;

      setDisplayedCards(newDisplayedCards);
      setSelectedCard(newSelectedCard);
    }
    setCheckIsDirty(false);
    setNewCardId(null);
  };

  return (
    <DataCardContext.Provider
      value={{
        displayedCards,
        selectedCard,
        shouldReload,
        triggerReload,
        setLoadedCards,
        addCard,
        selectCard,
      }}>
      <DataCardSwitchContext.Provider
        value={{
          checkIsDirty,
          switchToCard,
          leaveInput,
        }}>
        {props.children}
      </DataCardSwitchContext.Provider>
    </DataCardContext.Provider>
  );
};
