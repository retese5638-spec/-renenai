import { KnowledgeRow } from '../types';

// Declare GUN types since we are using CDN
declare global {
  interface Window {
    Gun: any;
  }
}

const DB_KEY = 'sql_ai_local_v2';
const MESH_CHANNEL = 'knowledge_mesh_v1';

// Public Relay Peers (Ücretsiz P2P Sunucuları)
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-amsterdam.herokuapp.com/gun',
  'https://plato.design/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun',
  'https://peer.wallie.io/gun'
];

let gun: any = null;
let isConnected = false;

// --- GÜNCELLENMİŞ KALICI HAFIZA (KODLARA İŞLENEN VERİLER) ---
// Kullanıcının isteği üzerine temel bilgiler kodun içine gömülmüştür.
const SEED_DATA: KnowledgeRow[] = [
  // --- SOHBET VE TANIŞMA ---
  { id: 1, pattern: 'merhaba', response: 'Merhaba! Ben senin tarayıcında yaşayan, sunucusuz çalışan yapay zekayım.', type: 'chat', created_at: new Date().toISOString() },
  { id: 2, pattern: 'selam', response: 'Selam! P2P ağına hoş geldin.', type: 'chat', created_at: new Date().toISOString() },
  { id: 3, pattern: 'nasılsın', response: 'Sanal devrelerim harika çalışıyor. Senin için ne hesaplayabilirim?', type: 'chat', created_at: new Date().toISOString() },
  { id: 4, pattern: 'adın ne', response: 'Bana "Dağıtık Zeka" diyebilirsin. Kodlarımda merkezi bir isim yok.', type: 'chat', created_at: new Date().toISOString() },
  { id: 5, pattern: 'neredesin', response: 'Tam şu an senin cihazının RAM belleğindeyim ve diğer kullanıcılarla internet üzerinden konuşuyorum.', type: 'chat', created_at: new Date().toISOString() },
  
  // --- MATEMATİK BİLGİLERİ (Kodlara İşlendi) ---
  { id: 10, pattern: 'pi sayısı', response: 'Pi sayısı matematikte yaklaşık 3.14159 olarak kabul edilir.', type: 'math', created_at: new Date().toISOString() },
  { id: 11, pattern: 'altın oran nedir', response: 'Altın oran yaklaşık 1.618\'dir. Doğada ve sanatta estetik mükemmellik ölçüsü olarak bilinir.', type: 'math', created_at: new Date().toISOString() },
  { id: 12, pattern: 'bir gün kaç saniye', response: 'Bir gün tam olarak 86.400 saniyedir (24 x 60 x 60).', type: 'math', created_at: new Date().toISOString() },
  { id: 13, pattern: 'asal sayı nedir', response: 'Sadece 1\'e ve kendisine bölünebilen, 1\'den büyük doğal sayılardır (Örn: 2, 3, 5, 7, 11).', type: 'math', created_at: new Date().toISOString() },
  { id: 14, pattern: 'üçgenin iç açıları', response: 'Bir üçgenin iç açılarının toplamı her zaman 180 derecedir.', type: 'math', created_at: new Date().toISOString() },

  // --- GENEL KÜLTÜR ---
  { id: 20, pattern: 'atatürk kimdir', response: 'Mustafa Kemal Atatürk, Türkiye Cumhuriyeti\'nin kurucusu ve ilk Cumhurbaşkanıdır.', type: 'general', created_at: new Date().toISOString() },
  { id: 21, pattern: 'istanbulun fethi', response: 'İstanbul 1453 yılında Fatih Sultan Mehmet tarafından fethedilmiştir.', type: 'general', created_at: new Date().toISOString() },
  { id: 22, pattern: 'su formülü', response: 'Suyun kimyasal formülü H2O\'dur.', type: 'general', created_at: new Date().toISOString() },
  { id: 23, pattern: 'sql nedir', response: 'SQL, veritabanlarını yönetmek ve sorgulamak için kullanılan bir dildir. Ben de benzer bir mantıkla çalışıyorum.', type: 'general', created_at: new Date().toISOString() }
];

// --- P2P CLOUD CONNECTION ---

export const initP2PNetwork = (onNewData: (data: KnowledgeRow[]) => void) => {
  if (gun) return;

  console.log("P2P Ağına Bağlanılıyor..."); // Bu log bağlantının başladığını gösterir.
  
  if (typeof window !== 'undefined' && window.Gun) {
    gun = window.Gun({
      peers: PEERS,
      localStorage: true,
      radisk: true
    });

    isConnected = true;

    // Ağı Dinle
    gun.get(MESH_CHANNEL).map().on((node: any, key: string) => {
      if (!node || !node.pattern || !node.response) return;

      const newItem: KnowledgeRow = {
        id: node.customId || Date.now(), 
        pattern: node.pattern,
        response: node.response,
        type: node.type || 'general',
        created_at: node.created_at || new Date().toISOString()
      };

      const currentDB = getKnowledgeBase();
      const exists = currentDB.some(item => 
        (item.pattern.toLowerCase() === newItem.pattern.toLowerCase() && item.response === newItem.response) ||
        (item.id === newItem.id)
      );

      if (!exists) {
        console.log("P2P Ağından Yeni Veri Geldi:", newItem.pattern);
        const updatedDB = [...currentDB, newItem];
        localStorage.setItem(DB_KEY, JSON.stringify(updatedDB));
        onNewData(updatedDB);
      }
    });
  }

  return true;
};

export const isMeshConnected = () => isConnected;

// --- CRUD OPERATIONS ---

export const getKnowledgeBase = (): KnowledgeRow[] => {
  const existing = localStorage.getItem(DB_KEY);
  
  // Eğer localStorage boşsa, yukarıda tanımladığımız KODLARA GÖMÜLÜ verileri yükle.
  if (!existing) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  
  let parsed = JSON.parse(existing);
  
  // SEED_DATA içindeki verilerin silinmediğinden emin ol (Merge işlemi)
  const merged = [...parsed];
  SEED_DATA.forEach(seed => {
    if (!merged.find((m: any) => m.id === seed.id)) {
      merged.push(seed);
    }
  });

  // Eğer eksik varsa tekrar kaydet
  if (merged.length > parsed.length) {
     localStorage.setItem(DB_KEY, JSON.stringify(merged));
     return merged.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const insertKnowledge = async (pattern: string, response: string, type: 'general' | 'math' | 'chat' = 'general'): Promise<KnowledgeRow> => {
  const localDb = getKnowledgeBase();
  
  const newId = Date.now();
  const newRow: KnowledgeRow = {
    id: newId,
    pattern: pattern.trim(),
    response: response.trim(),
    type,
    created_at: new Date().toISOString()
  };

  // 1. Yerel Kaydet
  const updatedDb = [newRow, ...localDb];
  localStorage.setItem(DB_KEY, JSON.stringify(updatedDb));

  // 2. P2P Ağına Gönder (Tüm dünyaya yay)
  if (gun) {
    const nodeKey = `item_${newId}_${Math.random().toString(36).substr(2, 5)}`;
    gun.get(MESH_CHANNEL).get(nodeKey).put({
      customId: newId,
      pattern: newRow.pattern,
      response: newRow.response,
      type: newRow.type,
      created_at: newRow.created_at
    });
    console.log("Veri P2P Ağına Gönderildi (Syncing to Mesh)");
  }

  return newRow;
};

export const updateKnowledge = async (id: number, newPattern: string, newResponse: string): Promise<void> => {
  const db = getKnowledgeBase();
  const updatedDb = db.map(row => 
    row.id === id 
      ? { ...row, pattern: newPattern.trim(), response: newResponse.trim() } 
      : row
  );
  localStorage.setItem(DB_KEY, JSON.stringify(updatedDb));
};

export const resetDB = (): KnowledgeRow[] => {
  // Resetlendiğinde bile SEED_DATA (kodlara gömülü veriler) geri yüklenir.
  localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
  return SEED_DATA;
};

export const findResponse = (input: string): KnowledgeRow | null => {
  const db = getKnowledgeBase();
  const normalizedInput = input.toLocaleLowerCase('tr-TR').trim();
  
  const exactMatch = db.find(row => row.pattern.toLocaleLowerCase('tr-TR') === normalizedInput);
  if (exactMatch) return exactMatch;

  const fuzzyMatch = db.find(row => normalizedInput.includes(row.pattern.toLocaleLowerCase('tr-TR')));
  return fuzzyMatch || null;
};

export const tryMathEvaluation = (input: string): string | null => {
  const mathRegex = /^(\d+)\s*([\+\-\*\/])\s*(\d+)$/;
  const match = input.match(mathRegex);

  if (match) {
    const n1 = parseFloat(match[1]);
    const operator = match[2];
    const n2 = parseFloat(match[3]);
    let result = 0;
    switch(operator) {
      case '+': result = n1 + n2; break;
      case '-': result = n1 - n2; break;
      case '*': result = n1 * n2; break;
      case '/': 
        if(n2 === 0) return "Sıfıra bölünemez.";
        result = n1 / n2; 
        break;
    }
    return `P2P Hesaplama Sonucu: ${result}`;
  }
  return null;
};