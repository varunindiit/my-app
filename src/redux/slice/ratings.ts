import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Rating {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  avatarUri?: string | null;
}

interface RatingsState {
  received: Rating[];
  given: Rating[];
  average: number;
  totalReviews: number;
  breakdown: {
    communication: number;
    punctuality: number;
    behaviour: number;
    cleanliness: number;
  };
}

const initialState: RatingsState = {
  average: 4,
  totalReviews: 2,
  breakdown: {
    communication: 5,
    punctuality: 4,
    behaviour: 4,
    cleanliness: 5,
  },
  received: [
    {
      id: "r1",
      authorName: "Sipho Mthembu",
      rating: 5,
      comment:
        "Justin was a great passenger! He arrived on time, communicated clearly throughout the trip, and was very respectful during the ride. Would gladly ride with him again!",
      date: "12 May",
    },
    {
      id: "r2",
      authorName: "Lindiwe Khumalo",
      rating: 3,
      comment:
        "Passenger was polite and friendly, but arrived around 15 minutes late to the pickup point which delayed the trip slightly. Overall the ride experience was still okay.",
      date: "9 May",
    },
  ],
  given: [
    {
      id: "g1",
      authorName: "Sipho Mthembu",
      rating: 5,
      comment:
        "Sipho was an excellent driver. He arrived on time, drove safely throughout the journey, and kept all passengers informed during the trip. The car was clean and comfortable too.",
      date: "12 May",
    },
    {
      id: "g2",
      authorName: "Lindiwe Khumalo",
      rating: 4,
      comment:
        "The ride experience was smooth overall and the driver was friendly, but the pickup was delayed by around 10 minutes due to traffic. Communication was still good and the trip felt safe.",
      date: "9 May",
    },
  ],
};

const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    addReceived: (state, action: PayloadAction<Rating>) => {
      state.received = [action.payload, ...state.received];
    },
    addGiven: (state, action: PayloadAction<Rating>) => {
      state.given = [action.payload, ...state.given];
    },
  },
});

export const { addReceived, addGiven } = ratingsSlice.actions;
export default ratingsSlice.reducer;
