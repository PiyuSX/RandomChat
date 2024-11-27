import React, { useState, useEffect } from 'react';
import { Send, SkipForward, X } from 'lucide-react';
import { Button } from './Button';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../hooks/useChat';
import { connectSocket, disconnectSocket } from '../lib/socket';

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const { 
    messages,
    isConnected,
    isFinding,
    strangerId,
    sendMessage,
    findStranger,
    nextStranger,
    leaveChat 
  } = useChat();

  useEffect(() => {
    connectSocket();
    findStranger();
    return () => {
      leaveChat();
      disconnectSocket();
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {isFinding ? 'Finding a stranger...' : 
           strangerId ? 'Chatting with Stranger' : 
           'Disconnected'}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={SkipForward}
            onClick={nextStranger}
            disabled={isFinding}
            className="!py-2"
          >
            Next
          </Button>
          <Button
            variant="secondary"
            icon={X}
            onClick={() => window.location.href = '/'}
            className="!py-2"
          >
            Leave
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 p-4 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={strangerId ? "Type a message..." : "Waiting for connection..."}
            disabled={!strangerId}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <Button 
            type="submit" 
            variant="primary" 
            icon={Send} 
            disabled={!strangerId}
            className="!py-2"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}