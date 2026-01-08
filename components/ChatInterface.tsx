import React, { useEffect, useRef } from 'react';
import { Message, BotState } from '../types';
import { Send, Cpu, Database, Save } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  botState: BotState;
  currentLearningTrigger: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  botState,
  currentLearningTrigger
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Yerel SQL-AI</h1>
            <p className="text-xs text-gray-400">Offline • Öğrenen • Kalıcı Hafıza</p>
          </div>
        </div>
        {botState === BotState.LEARNING && (
          <div className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs border border-yellow-500/20 animate-pulse">
            Öğrenme Modu Aktif
          </div>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.isSystem 
                    ? 'bg-gray-800 border border-green-500/30 text-green-400 font-mono text-sm w-full'
                    : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
              }`}
            >
              {msg.isSystem ? (
                <div className="flex items-center gap-2">
                  <Database size={14} />
                  {msg.text}
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              )}
              <span className="text-[10px] opacity-50 block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              botState === BotState.LEARNING
                ? `"${currentLearningTrigger}" için cevabı öğretin...`
                : "Bir şeyler sor veya matematik işlemi yaz (2+2)..."
            }
            className={`w-full p-4 pr-12 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                botState === BotState.LEARNING 
                ? 'focus:ring-yellow-500 border border-yellow-500/30' 
                : 'focus:ring-blue-500 border border-gray-700'
            }`}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                botState === BotState.LEARNING 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {botState === BotState.LEARNING ? <Save size={20} /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-2">
            {botState === BotState.LEARNING 
                ? "Girdiğiniz metin veritabanına kaydedilecek ve asla silinmeyecektir." 
                : "API yok. Sadece yerel SQL simülasyonu."}
        </p>
      </div>
    </div>
  );
};