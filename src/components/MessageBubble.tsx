import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const time = message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
        }`}
      >
        {!isUser && message.username && (
          <div className={`text-xs ${isUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'} mb-1`}>
            {message.username}
          </div>
        )}
        <p className="break-words">{message.content}</p>
        <span className={`text-xs ${isUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'} block mt-1`}>
          {time}
        </span>
      </div>
    </div>
  );
}