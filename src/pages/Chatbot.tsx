import React, { useState, useRef, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { ChatResponse } from '../services/sugarbiService';
import type { ChatMessage } from '../types';
import ChatMessageComponent from '../components/ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadExamples();
    // Mensaje de bienvenida
    setMessages([{
      id: '1',
      type: 'bot',
      content: '¡Hola! Soy el asistente de SugarBI. Puedes hacerme preguntas sobre la producción de caña, fincas, variedades, y más. ¿En qué te puedo ayudar?',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadExamples = async () => {
    try {
      const exampleQueries = await sugarbiService.getExampleQueries();
      setExamples(exampleQueries);
    } catch (error) {
      console.error('Error al cargar ejemplos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await sugarbiService.processChatQuery(inputValue);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.success 
          ? (response.natural_response || `Encontré ${response.record_count} registros para tu consulta.`)
          : response.error || 'Error al procesar la consulta',
        timestamp: new Date(),
        visualization: response.success ? response.visualization : undefined,
        sql: response.success ? response.sql : undefined,
        error: response.success ? undefined : response.error,
        raw_data: response.success ? response.raw_data : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
        error: error.message
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chatbot Inteligente</h1>
        <p className="mt-2 text-gray-600">
          Haz consultas en lenguaje natural sobre los datos de cosecha
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat principal */}
        <div className="lg:col-span-3">
          <div className="card h-[600px] flex flex-col">
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <ChatMessageComponent key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
                    <LoadingSpinner message="Procesando consulta..." size="sm" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu consulta aquí..."
                  className="flex-1 input-field"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel lateral con ejemplos */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ejemplos de Consultas
            </h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="card mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tipos de Consultas
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Rankings:</strong> "top 10 fincas por producción"
              </div>
              <div>
                <strong>Estadísticas:</strong> "promedio de brix por finca"
              </div>
              <div>
                <strong>Tendencias:</strong> "producción por mes en 2025"
              </div>
              <div>
                <strong>Comparaciones:</strong> "mejores variedades por TCH"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
