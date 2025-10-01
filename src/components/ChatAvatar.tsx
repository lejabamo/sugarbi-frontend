import React from 'react';

interface ChatAvatarProps {
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ChatAvatar: React.FC<ChatAvatarProps> = ({ isTyping = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {/* Robot con orejas de caña */}
      <div className="relative">
        {/* Cuerpo principal del robot (verde lima) */}
        <div className="w-4 h-4 bg-lime-400 rounded-full shadow-md border border-lime-500"></div>
        
        {/* Cabeza blanca con borde azul */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-500 shadow-sm"></div>
        
        {/* Orejas de caña (izquierda y derecha) */}
        <div className="absolute -top-1 -left-2 w-2 h-3 bg-green-500 rounded-full transform rotate-12 border border-green-600 shadow-sm"></div>
        <div className="absolute -top-1 -right-2 w-2 h-3 bg-green-500 rounded-full transform -rotate-12 border border-green-600 shadow-sm"></div>
        
        {/* Hojas adicionales en las orejas */}
        <div className="absolute -top-2 -left-3 w-1.5 h-2 bg-green-400 rounded-full transform rotate-45"></div>
        <div className="absolute -top-2 -right-3 w-1.5 h-2 bg-green-400 rounded-full transform -rotate-45"></div>
        
        {/* Antena azul */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-blue-500"></div>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-lime-400 rounded-full border border-blue-500"></div>
        
        {/* Ojos azules */}
        <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-blue-600 rounded-full"></div>
        <div className="absolute top-0.5 right-1 w-0.5 h-0.5 bg-blue-600 rounded-full"></div>
        
        {/* Sonrisa azul */}
        <div className="absolute top-1.5 left-0.5 right-0.5 h-0.5 border-b-2 border-blue-600 rounded-full"></div>
        
        {/* Detalles del cuerpo (nudos de caña) */}
        <div className="absolute top-1/2 left-0 right-0 w-2 h-0.5 bg-green-600 rounded-full mx-auto"></div>
        <div className="absolute bottom-1/3 left-0 right-0 w-2 h-0.5 bg-green-600 rounded-full mx-auto"></div>
        
        {/* Animación de escritura */}
        {isTyping && (
          <div className="absolute -bottom-1 -right-1 flex space-x-0.5">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAvatar;
