export interface KnowledgeRow {
  id: number;
  pattern: string; // The user input (trigger)
  response: string; // The bot response
  type: 'math' | 'chat' | 'general';
  created_at: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isSystem?: boolean; // For database logs
}

export enum BotState {
  IDLE = 'IDLE',
  LEARNING = 'LEARNING' // Waiting for user to provide the answer
}