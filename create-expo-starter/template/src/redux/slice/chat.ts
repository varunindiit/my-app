import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatarUri?: string | null;
  route: { from: string; to: string };
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
  messages: ChatMessage[];
}

interface ChatState {
  conversations: Conversation[];
}

const baseMessages: ChatMessage[] = [
  {
    id: "m1",
    text: "Hey Sarah, I'm leaving Douala now. ETA to pickup is around 8:20 AM.",
    sender: "other",
    time: "11:00",
  },
  {
    id: "m2",
    text: "Perfect 👍 I'm near Total Energies station as mentioned.",
    sender: "me",
    time: "11:05",
  },
  {
    id: "m3",
    text: "Great. Please wear something visible because traffic is heavy there",
    sender: "other",
    time: "11:06",
  },
  {
    id: "m4",
    text: "Haha sure, I'm wearing a yellow jacket.",
    sender: "me",
    time: "11:06",
  },
  {
    id: "m5",
    text: "Got it. Also, one passenger may join at Bonaberi on the way.",
    sender: "other",
    time: "11:08",
  },
];

const initial: ChatState = {
  conversations: [
    {
      id: "c1",
      name: "Matt Mitchell",
      route: { from: "Yaoundé", to: "Douala" },
      lastMessage: "Got it. Also, are passengers carry pick at Bambam on...",
      lastTime: "15 May",
      unread: 1,
      messages: baseMessages,
    },
    {
      id: "c2",
      name: "Timothy Stone",
      route: { from: "Douala", to: "Bafoussam" },
      lastMessage: "See you tomorrow at 8.",
      lastTime: "12 May",
      messages: [],
    },
    {
      id: "c3",
      name: "Kari Ray",
      route: { from: "Yaoundé", to: "Douala" },
      lastMessage: "Thanks for the ride!",
      lastTime: "10 May",
      messages: [],
    },
  ],
};

const chatSlice = createSlice({
  name: "chat",
  initialState: initial,
  reducers: {
    sendMessage: (
      state,
      action: PayloadAction<{ conversationId: string; text: string }>,
    ) => {
      const c = state.conversations.find(
        (x) => x.id === action.payload.conversationId,
      );
      if (c) {
        c.messages.push({
          id: `${Date.now()}`,
          text: action.payload.text,
          sender: "me",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        c.lastMessage = action.payload.text;
        c.lastTime = "now";
      }
    },
    markRead: (state, action: PayloadAction<string>) => {
      const c = state.conversations.find((x) => x.id === action.payload);
      if (c) c.unread = 0;
    },
  },
});

export const { sendMessage, markRead } = chatSlice.actions;
export default chatSlice.reducer;
