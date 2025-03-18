import { createContext, ReactNode, useMemo, useState } from "react";
import { DataCardEntity } from "./dataCards.tsx";

interface DataCardContextProps {
  cards: DataCardEntity[];
  displayedCards: DataCardEntity[];
  selectedCard: DataCardEntity | null;
  shouldReload: boolean;
  setLoadedCards: (loadedCards: DataCardEntity[]) => void;
  triggerReload: () => void;
  addCard: (card: DataCardEntity) => void;
  selectCard: (card: DataCardEntity | null) => void;
}

export const DataCardContext = createContext<DataCardContextProps>({
  cards: [],
  displayedCards: [],
  selectedCard: null,
  shouldReload: false,
  setLoadedCards: () => {},
  triggerReload: () => {},
  addCard: () => {},
  selectCard: () => {},
});

interface DataCardSwitchContextProps {
  newCardIndex?: number | null;
  checkIsDirty: boolean;
  switchToCard: (card: DataCardEntity) => void;
  leaveInput: (canLeave: boolean, newCards?: DataCardEntity[]) => void;
}

export const DataCardSwitchContext = createContext<DataCardSwitchContextProps>({
  newCardIndex: null,
  checkIsDirty: false,
  switchToCard: () => {},
  leaveInput: () => {},
});

interface DataCardExternalContextProps {
  resetCanSwitch: () => void;
  triggerCanSwitch: () => void;
  canSwitch: number;
}

export const DataCardExternalContext = createContext<DataCardExternalContextProps>({
  resetCanSwitch: () => {},
  triggerCanSwitch: () => {},
  canSwitch: 0,
});

interface DataCardProviderProps {
  children: ReactNode;
}

export const DataCardProvider = ({ children }: DataCardProviderProps) => {
  const [cards, setCards] = useState<DataCardEntity[]>([]);
  const [displayedCards, setDisplayedCards] = useState<DataCardEntity[]>([]);
  const [selectedCard, setSelectedCard] = useState<DataCardEntity | null>(null);
  const [shouldReload, setShouldReload] = useState<boolean>(false);
  const [checkIsDirty, setCheckIsDirty] = useState<boolean>(false);
  const [newCardId, setNewCardId] = useState<number | null>(null);
  const [canSwitch, setCanSwitch] = useState<number>(0);

  const tempCard = { id: 0 };

  const setLoadedCards = (loadedCards: DataCardEntity[]) => {
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

  const addCard = (card: DataCardEntity) => {
    setDisplayedCards([card, ...displayedCards]);
    setSelectedCard(card);
  };

  const selectCard = (card: DataCardEntity | null) => {
    if (card === null) {
      setDisplayedCards(cards);
    }
    setSelectedCard(card);
  };

  const triggerReload = () => {
    setShouldReload(true);
  };

  const switchToCard = (card: DataCardEntity) => {
    setNewCardId(card?.id ?? null);
    setCheckIsDirty(true);
  };

  const leaveInput = (canLeave: boolean, newCards?: DataCardEntity[]) => {
    if (canLeave) {
      let newDisplayedCards = newCards ? newCards : cards;
      if (newCardId === 0) {
        newDisplayedCards = [tempCard, ...newDisplayedCards];
      }
      const newSelectedCard = newDisplayedCards.find(c => c.id === newCardId) || null;

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
      value={useMemo(
        () => ({
          cards,
          displayedCards,
          selectedCard,
          shouldReload,
          triggerReload,
          setLoadedCards,
          addCard,
          selectCard,
        }),
        [cards, displayedCards, selectedCard, shouldReload, triggerReload, setLoadedCards, addCard, selectCard],
      )}>
      <DataCardSwitchContext.Provider
        value={useMemo(() => ({ checkIsDirty, switchToCard, leaveInput }), [checkIsDirty, switchToCard, leaveInput])}>
        <DataCardExternalContext.Provider
          value={useMemo(
            () => ({ resetCanSwitch, triggerCanSwitch, canSwitch }),
            [resetCanSwitch, triggerCanSwitch, canSwitch],
          )}>
          {children}
        </DataCardExternalContext.Provider>
      </DataCardSwitchContext.Provider>
    </DataCardContext.Provider>
  );
};
