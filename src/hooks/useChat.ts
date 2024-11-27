import { useEffect } from 'react';
import { nanoid } from 'nanoid';
import { socket } from '../lib/socket';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { Message } from '../types';

export function useChat() {
  const { 
    messages,
    isConnected,
    isFinding,
    strangerId,
    addMessage,
    clearMessages,
    setIsConnected,
    setIsFinding,
    setStrangerId
  } = useChatStore();

  const { username } = useUserStore();

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setStrangerId(null);
      clearMessages();
    });

    socket.on('stranger-found', ({ strangerId, username: strangerName }) => {
      setStrangerId(strangerId);
      setIsFinding(false);
      addMessage({
        id: nanoid(),
        content: `You are now chatting with ${strangerName || 'a stranger'}`,
        sender: 'system',
        timestamp: new Date(),
      });
    });

    socket.on('stranger-left', () => {
      setStrangerId(null);
      addMessage({
        id: nanoid(),
        content: 'Stranger has disconnected',
        sender: 'system',
        timestamp: new Date(),
      });
    });

    socket.on('chat-message', (message: Message) => {
      addMessage({
        ...message,
        timestamp: new Date(message.timestamp),
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('stranger-found');
      socket.off('stranger-left');
      socket.off('chat-message');
    };
  }, [addMessage, clearMessages, setIsConnected, setIsFinding, setStrangerId]);

  const findStranger = (type: 'text' | 'video' = 'text') => {
    clearMessages();
    setIsFinding(true);
    socket.emit('find-stranger', { type, username });
  };

  const sendMessage = (content: string) => {
    if (!strangerId || !content.trim()) return;

    const message: Message = {
      id: nanoid(),
      content,
      sender: 'user',
      timestamp: new Date(),
      username,
    };

    socket.emit('send-message', {
      to: strangerId,
      message,
    });

    addMessage(message);
  };

  const nextStranger = () => {
    if (strangerId) {
      socket.emit('leave-chat');
    }
    findStranger();
  };

  const leaveChat = () => {
    if (strangerId) {
      socket.emit('leave-chat');
    }
    setStrangerId(null);
    clearMessages();
  };

  return {
    messages,
    isConnected,
    isFinding,
    strangerId,
    sendMessage,
    findStranger,
    nextStranger,
    leaveChat,
  };
}