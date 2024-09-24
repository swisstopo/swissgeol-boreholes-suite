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

export const DataCardExternalContext = createContext({
  resetCanSwitch: () => {},
  triggerCanSwitch: () => {},
  canSwitch: 0,
});

export const DataCardProvider = props => {
  const [cards, setCards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);
  const [checkIsDirty, setCheckIsDirty] = useState(false);
  const [newCardId, setNewCardId] = useState(null);
  const [canSwitch, setCanSwitch] = useState(0);

  const tempCard = { id: 0 };

  const setLoadedCards = loadedCards => {
    setShouldReload(false);
    setCards(loadedCards);

    if (checkIsDirty) {
      leaveInput(true, loadedCards);
    } else {
      setDisplayedCards(loadedCards);
      setSelectedCard(null);
      setCanSwitch(0);
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
    setCanSwitch(canLeave ? 1 : -1);
  };

  const triggerCanSwitch = () => {
    if (selectedCard !== null) {
      setCanSwitch(0);
      setCheckIsDirty(true);
    } else {
      setCanSwitch(1);
    }
  };

  const resetCanSwitch = () => {
    setCanSwitch(0);
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
        <DataCardExternalContext.Provider value={{ resetCanSwitch, triggerCanSwitch, canSwitch }}>
          {props.children}
        </DataCardExternalContext.Provider>
      </DataCardSwitchContext.Provider>
    </DataCardContext.Provider>
  );
};
