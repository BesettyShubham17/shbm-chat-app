import { create } from "zustand";

export interface Reaction {
  emoji: string;
  sender: string;
}

export interface Attachment {
  type: "image" | "document" | "audio" | "video" | "link" | "location" | "contact";
  url?: string;
  name?: string;
  size?: number;
  preview?: string;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
  replyTo?: string | null;
  reactions?: Reaction[];
  attachment?: Attachment;
  isEdited?: boolean;
  isDeleted?: boolean;
  status?: string;
}

export interface ChatUser {
  _id: string;
  username: string;
  avatar: string;
  status: string;
  lastSeen?: string;
  isBot?: boolean;
}

interface ChatState {
  activeChat: ChatUser | null;
  messages: Message[];
  typingUsers: Set<string>;
  replyingTo: Message | null;
  rightSidebarOpen: boolean;
  setActiveChat: (user: ChatUser | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  toggleRightSidebar: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  messages: [],
  typingUsers: new Set(),
  replyingTo: null,
  rightSidebarOpen: false,
  setActiveChat: (user) => set({ activeChat: user, replyingTo: null }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      if (state.messages.some((m) => m._id === message._id)) return state;
      return { messages: [...state.messages, message] };
    }),
  updateMessage: (updatedMsg) =>
    set((state) => ({
      messages: state.messages.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)),
    })),
  addTypingUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.typingUsers);
      newSet.add(userId);
      return { typingUsers: newSet };
    }),
  removeTypingUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.typingUsers);
      newSet.delete(userId);
      return { typingUsers: newSet };
    }),
  setReplyingTo: (message) => set({ replyingTo: message }),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
}));
