import React, { useState } from 'react';
import { KnowledgeRow } from '../types';
import { Database, Search, Pencil, Check, X, RefreshCcw, Plus, Save } from 'lucide-react';
import * as dbService from '../services/dbService';

interface DatabaseViewProps {
  data: KnowledgeRow[];
  onDataChange: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ data, onDataChange }) => {
  const [filter, setFilter] = React.useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ pattern: string; response: string }>({ pattern: '', response: '' });
  
  // New State for "Add Mode"
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<{ pattern: string; response: string }>({ pattern: '', response: '' });

  const filteredData = data.filter(row => 
    row.pattern.toLowerCase().includes(filter.toLowerCase()) || 
    row.response.toLowerCase().includes(filter.toLowerCase())
  );

  // --- EDITING LOGIC ---
  const startEditing = (row: KnowledgeRow) => {
    // Close add mode if open
    setIsAdding(false);
    setEditingId(row.id);
    setEditForm({ pattern: row.pattern, response: row.response });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ pattern: '', response: '' });
  };

  const saveEditing = (id: number) => {
    if (!editForm.pattern.trim() || !editForm.response.trim()) return;
    dbService.updateKnowledge(id, editForm.pattern, editForm.response);
    setEditingId(null);
    onDataChange(); 
  };

  // --- ADDING LOGIC ---
  const handleAddNewClick = () => {
    setFilter(''); // Clear filter to ensure user sees the new item
    setEditingId(null); // Cancel any active edits
    setIsAdding(true);
    setNewEntry({ pattern: '', response: '' });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewEntry({ pattern: '', response: '' });
  };

  const saveNewEntry = () => {
    if (!newEntry.pattern.trim() || !newEntry.response.trim()) return;
    
    // Insert into DB
    dbService.insertKnowledge(newEntry.pattern, newEntry.response, 'general');
    
    setIsAdding(false);
    setNewEntry({ pattern: '', response: '' });
    onDataChange();
  };

  const handleReset = () => {
    if (confirm('Tüm veritabanını varsayılan ayarlara (genişletilmiş paket) döndürmek istiyor musunuz? Yaptığınız özel değişiklikler silinecektir.')) {
      dbService.resetDB();
      onDataChange();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800 w-full md:w-96">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center justify-between text-white mb-4">
          <div className="flex items-center gap-2">
            <Database className="text-purple-500" />
            <h2 className="font-bold">Veritabanı (SQL)</h2>
          </div>
          <div className="flex gap-1">
            <button 
                onClick={handleAddNewClick}
                className="flex items-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all"
                title="Yeni Veri Ekle"
            >
                <Plus size={14} />
                <span>Ekle</span>
            </button>
            <button 
                onClick={handleReset}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                title="Varsayılan Verileri Yükle (Reset)"
            >
                <RefreshCcw size={16} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Tabloda ara..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3 scrollbar-hide">
        <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider flex justify-between items-center">
          <span>Table: knowledge_base ({data.length} rows)</span>
        </div>

        {/* --- ADD NEW ENTRY FORM --- */}
        {isAdding && (
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">YENİ KAYIT</span>
                <div className="flex gap-1">
                  <button onClick={saveNewEntry} className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white" title="Ekle">
                    <Save size={14} />
                  </button>
                  <button onClick={cancelAdding} className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded text-white" title="İptal">
                    <X size={14} />
                  </button>
                </div>
             </div>
             <div className="space-y-2">
                <div>
                   <label className="text-xs text-blue-300 block mb-1">Öğretilecek Soru (Girdi):</label>
                   <input 
                     type="text" 
                     placeholder="Örn: Elma nedir?"
                     value={newEntry.pattern} 
                     onChange={(e) => setNewEntry({...newEntry, pattern: e.target.value})}
                     className="w-full bg-gray-900 text-sm text-white rounded p-2 border border-blue-500/30 focus:border-blue-500 outline-none placeholder-gray-600"
                     autoFocus
                   />
                </div>
                <div>
                   <label className="text-xs text-blue-300 block mb-1">Cevabı:</label>
                   <textarea 
                     placeholder="Örn: Elma bir meyvedir."
                     value={newEntry.response} 
                     onChange={(e) => setNewEntry({...newEntry, response: e.target.value})}
                     className="w-full bg-gray-900 text-sm text-white rounded p-2 border border-blue-500/30 focus:border-blue-500 outline-none min-h-[60px] placeholder-gray-600"
                   />
                </div>
             </div>
          </div>
        )}

        {/* --- EXISTING DATA LIST --- */}
        {filteredData.slice().reverse().map((row) => (
          <div key={row.id} className={`bg-gray-800 rounded-lg p-3 border transition-colors ${editingId === row.id ? 'border-yellow-500' : 'border-gray-700 hover:border-purple-500/50'}`}>
            
            {editingId === row.id ? (
              // EDIT MODE
              <div className="space-y-3">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] bg-yellow-900/30 text-yellow-400 px-1.5 py-0.5 rounded font-mono">EDITING ID: {row.id}</span>
                   <div className="flex gap-1">
                      <button onClick={() => saveEditing(row.id)} className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white" title="Kaydet">
                        <Check size={14} />
                      </button>
                      <button onClick={cancelEditing} className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded text-white" title="İptal">
                        <X size={14} />
                      </button>
                   </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Girdi (Input)</label>
                    <input 
                      type="text" 
                      value={editForm.pattern} 
                      onChange={(e) => setEditForm({...editForm, pattern: e.target.value})}
                      className="w-full bg-gray-900 text-sm text-white rounded p-2 border border-gray-600 focus:border-yellow-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Cevap (Output)</label>
                    <textarea 
                      value={editForm.response} 
                      onChange={(e) => setEditForm({...editForm, response: e.target.value})}
                      className="w-full bg-gray-900 text-sm text-white rounded p-2 border border-gray-600 focus:border-yellow-500 outline-none min-h-[60px]"
                    />
                 </div>
              </div>
            ) : (
              // VIEW MODE
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono">ID: {row.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      row.type === 'math' ? 'bg-red-900/30 text-red-400' :
                      row.type === 'chat' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>{row.type}</span>
                  </div>
                  <button 
                    onClick={() => startEditing(row)}
                    className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                    title="Düzenle"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Girdi (Input):</div>
                  <div className="text-sm text-white font-medium break-words">{row.pattern}</div>
                  <div className="h-px bg-gray-700 my-2" />
                  <div className="text-xs text-gray-400">Cevap (Output):</div>
                  <div className="text-sm text-gray-300 break-words">{row.response}</div>
                </div>
              </>
            )}

          </div>
        ))}
        {filteredData.length === 0 && !isAdding && (
            <div className="text-center py-10 text-gray-600 text-sm flex flex-col items-center gap-2">
                <span>Kayıt bulunamadı.</span>
                <span className="text-xs text-gray-700">Aramayı temizleyin veya yeni ekleyin.</span>
            </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-800 text-[10px] text-gray-500 text-center font-mono">
        storage: localStorage / status: persistent
      </div>
    </div>
  );
};