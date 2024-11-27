export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'stranger' | 'system';
  timestamp: Date;
  username?: string;
}

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isFinding: boolean;
  strangerId: string | null;
}