import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardBrand } from "../../utils/card";

export interface SavedCard {
  id: string;
  holderName: string;
  /** Last 4 digits only — full PAN is never persisted. */
  last4: string;
  brand: CardBrand;
  /** `MM/YY` */
  expiry: string;
  isDefault: boolean;
}

interface CardsState {
  cards: SavedCard[];
  selectedCardId: string | null;
}

const initialState: CardsState = {
  cards: [
    {
      id: "card_seed_1",
      holderName: "Paul Nkeng",
      last4: "4242",
      brand: "visa",
      expiry: "08/27",
      isDefault: true,
    },
    {
      id: "card_seed_2",
      holderName: "Paul Nkeng",
      last4: "5314",
      brand: "mastercard",
      expiry: "11/26",
      isDefault: false,
    },
  ],
  selectedCardId: "card_seed_1",
};

const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    /** Add a card. First card (or one flagged default) becomes the default. */
    addCard: (state, action: PayloadAction<SavedCard>) => {
      const card = action.payload;
      const makeDefault = card.isDefault || state.cards.length === 0;
      if (makeDefault) {
        state.cards.forEach((c) => {
          c.isDefault = false;
        });
      }
      state.cards.push({ ...card, isDefault: makeDefault });
      state.selectedCardId = card.id;
    },
    removeCard: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const removed = state.cards.find((c) => c.id === id);
      state.cards = state.cards.filter((c) => c.id !== id);
      // Keep a default + selection coherent after a removal.
      if (removed?.isDefault && state.cards.length > 0) {
        state.cards[0].isDefault = true;
      }
      if (state.selectedCardId === id) {
        state.selectedCardId =
          state.cards.find((c) => c.isDefault)?.id ??
          state.cards[0]?.id ??
          null;
      }
    },
    setDefaultCard: (state, action: PayloadAction<string>) => {
      state.cards.forEach((c) => {
        c.isDefault = c.id === action.payload;
      });
    },
    selectCard: (state, action: PayloadAction<string>) => {
      state.selectedCardId = action.payload;
    },
  },
});

export const { addCard, removeCard, setDefaultCard, selectCard } =
  cardsSlice.actions;
export default cardsSlice.reducer;
