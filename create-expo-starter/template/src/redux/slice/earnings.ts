import { createSlice } from "@reduxjs/toolkit";

export type EarningMethod = "mtn" | "transfer";

export interface EarningTransaction {
  id: string;
  passengerName: string;
  date: string;
  account: string;
  type: string;
  amount: number;
  method: EarningMethod;
}

interface EarningsState {
  total: number;
  totalTrips: number;
  tripsTrend: number;
  earnedTrend: number;
  transactions: EarningTransaction[];
}

const initialState: EarningsState = {
  total: 12500,
  totalTrips: 30,
  tripsTrend: 22,
  earnedTrend: 22,
  transactions: [
    {
      id: "e1",
      passengerName: "Sherry Burke",
      date: "28 may",
      type: "Instant",
      account: "xxxxxxxxx 653",
      amount: 4400,
      method: "mtn",
    },
    {
      id: "e2",
      passengerName: "Keith Franco",
      date: "28 may",
      type: "Instant",
      account: "xxxxxxxxx 653",
      amount: 4400,
      method: "transfer",
    },
    {
      id: "e3",
      passengerName: "Cathy Silva",
      date: "28 may",
      type: "Instant",
      account: "xxxxxxxxx 653",
      amount: 4400,
      method: "mtn",
    },
    {
      id: "e4",
      passengerName: "Jan Silva",
      date: "28 may",
      type: "Instant",
      account: "xxxxxxxxx 653",
      amount: 4400,
      method: "transfer",
    },
    {
      id: "e5",
      passengerName: "Curtis Torres",
      date: "28 may",
      type: "Instant",
      account: "xxxxxxxxx 653",
      amount: 4400,
      method: "transfer",
    },
    {
      id: "e6",
      passengerName: "Bob Sutton",
      date: "28 may",
      type: "Instant",
      account: "xxxxxxxxx 653",
      amount: 4400,
      method: "transfer",
    },
  ],
};

const earningsSlice = createSlice({
  name: "earnings",
  initialState,
  reducers: {},
});

export default earningsSlice.reducer;
