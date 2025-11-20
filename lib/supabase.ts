import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PartnerRole = 'partner_a' | 'partner_b';
export type MessageRole = 'partner_a' | 'partner_b' | 'bot_to_a' | 'bot_to_b' | 'bot_general';
export type SessionStatus = 'waiting' | 'active' | 'advice_ready' | 'completed';

export interface Session {
  id: string;
  session_code: string;
  status: SessionStatus;
  partner_a_ready: boolean;
  partner_b_ready: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface SessionContext {
  id: string;
  session_id: string;
  partner_role: PartnerRole;
  conversation_history: Array<{ role: string; parts: Array<{ text: string }> }>;
  updated_at: string;
}
