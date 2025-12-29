
export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  role: Role;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserPreferences {
  name: string;
  location: string;
  depthPreference: 'simple' | 'detailed' | 'scholarly';
  language: 'English' | 'Arabic' | 'Urdu';
}
