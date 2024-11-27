import { create } from 'zustand';
import { Message } from '../types';

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isFinding: boolean;
  strangerId: string | null;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setIsConnected: (status: boolean) => void;
  setIsFinding: (status: boolean) => void;
  setStrangerId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isConnected: false,
  isFinding: false,
  strangerId: null,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  clearMessages: () => set({ messages: [] }),
  setIsConnected: (status) => set({ isConnected: status }),
  setIsFinding: (status) => set({ isFinding: status }),
  setStrangerId: (id) => set({ strangerId: id }),
}));