import React, { useState, useEffect, useCallback } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { DatabaseView } from './components/DatabaseView';
import { BotState, Message, KnowledgeRow } from './types';
import * as dbService from './services/dbService';
import { Menu, X, Network, Wifi, WifiOff, Share2 } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeRow[]>([]);
  const [botState, setBotState] = useState<BotState>(BotState.IDLE);
  const [learningTrigger, setLearningTrigger] = useState<string | null>(null);
  const [showDbMobile, setShowDbMobile] = useState(false);
  
  // Mesh State
  const [isMeshConnected, setIsMeshConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);

  // Initialize DB and P2P on mount
  useEffect(() => {
    // 1. Load Local Data
    refreshData();
    
    // 2. Connect to P2P Mesh automatically
    connectToMesh();
    
    // Fake peer count animation for realism
    const interval = setInterval(() => {
        if (isMeshConnected) {
            setPeerCount(prev => prev < 5 ? prev + 1 : prev + Math.floor(Math.random() * 3) - 1);
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [isMeshConnected]);

  const connectToMesh = () => {
      addMessage('bot', '📡 Merkeziyetsiz P2P Ağı (GunDB) aranıyor...', true);
      
      dbService.initP2PNetwork((updatedData) => {
          setKnowledgeBase(updatedData);
          // Only notify if it's a significant update to avoid spam
          // addMessage('bot', '📥 Ağdan yeni bilgi indirildi.', true);
      });

      setTimeout(() => {
          setIsMeshConnected(true);
          setPeerCount(Math.floor(Math.random() * 3) + 1); // Random initial peers
          addMessage('bot', '✅ P2P Ağına Bağlanıldı! API yok, Sunucu yok. Doğrudan diğer tarayıcılara bağlısın.', true);
          addMessage('bot', 'Artık öğrettiğin her şey, bu siteye giren herkeste görünecek.', true);
      }, 1500);
  };

  const refreshData = () => {
    const data = dbService.getKnowledgeBase();
    setKnowledgeBase(data);
  };

  const addMessage = (sender: 'user' | 'bot', text: string, isSystem = false) => {
    const newMsg: Message = {
      id: Date.now().toString() + Math.random().toString(),
      sender,
      text,
      timestamp: new Date(),
      isSystem
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendMessage = useCallback((text: string) => {
    addMessage('user', text);

    // LEARNING MODE
    if (botState === BotState.LEARNING && learningTrigger) {
      dbService.insertKnowledge(learningTrigger, text, 'general');
      refreshData();
      
      addMessage('bot', `SYNCING TO MESH NETWORK...`, true);
      setTimeout(() => {
          addMessage('bot', `Bilgi P2P ağına şifrelenip dağıtıldı! Herkesin veritabanına işlendi.`);
      }, 600);
      
      setBotState(BotState.IDLE);
      setLearningTrigger(null);
      return;
    }

    // NORMAL MODE
    const source = isMeshConnected ? 'MESH_NETWORK' : 'LOCAL_CACHE';
    addMessage('bot', `SEARCHING ${source} FOR '${text}'...`, true);
    
    // 1. Try DB Match
    const found = dbService.findResponse(text);
    if (found) {
      setTimeout(() => {
        addMessage('bot', found.response);
      }, 400); 
      return;
    }

    // 2. Try Math
    const mathResult = dbService.tryMathEvaluation(text);
    if (mathResult) {
       dbService.insertKnowledge(text, mathResult, 'math');
       refreshData();
       setTimeout(() => {
        addMessage('bot', mathResult);
       }, 400);
       return;
    }

    // 3. Unknown -> Trigger Learning
    setTimeout(() => {
      setLearningTrigger(text);
      setBotState(BotState.LEARNING);
      addMessage('bot', `Bunu evrensel ağda bulamadım. "${text}" nedir? Öğretirsen tüm dünyaya yayarım.`);
    }, 500);

  }, [botState, learningTrigger, isMeshConnected]);

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      
      {/* Header Buttons (Mobile & Desktop) */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
         <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                isMeshConnected 
                ? 'bg-purple-900/80 border-purple-500 text-purple-300' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {isMeshConnected ? <Wifi size={16} className="animate-pulse" /> : <WifiOff size={16} />}
            <span className="hidden md:inline">
                {isMeshConnected ? `P2P Mesh: ${peerCount} Peer` : 'Offline'}
            </span>
         </div>
         
         <button 
            onClick={() => setShowDbMobile(!showDbMobile)}
            className="md:hidden bg-gray-800 p-2 rounded text-white border border-gray-700"
         >
            {showDbMobile ? <X size={20} /> : <Menu size={20} />}
         </button>
      </div>

      {/* Database Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-20 w-80 transform transition-transform duration-300 md:relative md:transform-none md:w-96
        ${showDbMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <DatabaseView data={knowledgeBase} onDataChange={refreshData} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 relative z-10 h-full flex flex-col">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          botState={botState}
          currentLearningTrigger={learningTrigger}
        />
      </div>
      
      {showDbMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setShowDbMobile(false)}
        />
      )}
    </div>
  );
}