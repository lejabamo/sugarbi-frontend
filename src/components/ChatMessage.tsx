import React, { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import Chart from './Chart';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const [showSQL, setShowSQL] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Contenido del mensaje */}
        <p className="text-sm">{message.content}</p>
        
        {/* Error message */}
        {message.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <strong>Error:</strong> {message.error}
          </div>
        )}
        
        {/* Visualización */}
        {message.visualization && (
          <div className="mt-3">
            <div className="bg-white p-3 rounded border">
              <Chart
                type={message.visualization.type || 'bar'}
                data={message.visualization.data}
                options={message.visualization.options}
              />
            </div>
          </div>
        )}
        
        {/* SQL Query */}
        {message.sql && (
          <div className="mt-3">
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showSQL ? 'Ocultar' : 'Ver'} SQL
            </button>
            {showSQL && (
              <div className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono overflow-x-auto">
                <pre>{message.sql}</pre>
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <p className={`text-xs mt-1 ${
          isUser ? 'text-primary-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
