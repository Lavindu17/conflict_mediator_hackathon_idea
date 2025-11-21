import { supabase, Session, Message, SessionContext, PartnerRole, MessageRole } from './supabase';

export const createSession = async (
  sessionCode: string,
  partnerInfo?: { name: string; age: number; gender: string; email: string }
): Promise<Session | null> => {
  const existingSession = await getSessionByCode(sessionCode);
  if (existingSession) {
    return existingSession;
  }

  const sessionData: any = {
    session_code: sessionCode,
    status: 'waiting',
    partner_a_ready: false,
    partner_b_ready: false,
  };

  if (partnerInfo) {
    sessionData.partner_a_name = partnerInfo.name;
    sessionData.partner_a_age = partnerInfo.age;
    sessionData.partner_a_gender = partnerInfo.gender;
    sessionData.partner_a_email = partnerInfo.email;
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  if (data) {
    await supabase.from('session_context').insert([
      { session_id: data.id, partner_role: 'partner_a', conversation_history: [] },
      { session_id: data.id, partner_role: 'partner_b', conversation_history: [] },
    ]);
  }

  return data;
};

export const updatePartnerInfo = async (
  sessionId: string,
  partnerRole: 'partner_a' | 'partner_b',
  partnerInfo: { name: string; age: number; gender: string; email: string }
): Promise<boolean> => {
  const updates: any = {};

  if (partnerRole === 'partner_a') {
    updates.partner_a_name = partnerInfo.name;
    updates.partner_a_age = partnerInfo.age;
    updates.partner_a_gender = partnerInfo.gender;
    updates.partner_a_email = partnerInfo.email;
  } else {
    updates.partner_b_name = partnerInfo.name;
    updates.partner_b_age = partnerInfo.age;
    updates.partner_b_gender = partnerInfo.gender;
    updates.partner_b_email = partnerInfo.email;
  }

  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating partner info:', error);
    return false;
  }

  return true;
};

export const getSessionByCode = async (sessionCode: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('session_code', sessionCode)
    .maybeSingle();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return data;
};

export const updateSessionStatus = async (
  sessionId: string,
  status: string,
  partnerAReady?: boolean,
  partnerBReady?: boolean
): Promise<boolean> => {
  const updates: any = { status, updated_at: new Date().toISOString() };

  if (partnerAReady !== undefined) updates.partner_a_ready = partnerAReady;
  if (partnerBReady !== undefined) updates.partner_b_ready = partnerBReady;

  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session:', error);
    return false;
  }

  return true;
};

export const addMessage = async (
  sessionId: string,
  role: MessageRole,
  content: string
): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding message:', error);
    return null;
  }

  return data;
};

export const getMessages = async (
  sessionId: string,
  partnerRole: PartnerRole
): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select()
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).filter((msg) => {
    if (msg.role === partnerRole) return true;
    if (msg.role === `bot_to_${partnerRole.split('_')[1]}`) return true;
    if (msg.role === 'bot_general') return true;
    return false;
  });
};

export const getSessionContext = async (
  sessionId: string,
  partnerRole: PartnerRole
): Promise<SessionContext | null> => {
  const { data, error } = await supabase
    .from('session_context')
    .select()
    .eq('session_id', sessionId)
    .eq('partner_role', partnerRole)
    .maybeSingle();

  if (error) {
    console.error('Error fetching session context:', error);
    return null;
  }

  return data;
};

export const updateSessionContext = async (
  sessionId: string,
  partnerRole: PartnerRole,
  conversationHistory: any[]
): Promise<boolean> => {
  const { error } = await supabase
    .from('session_context')
    .update({
      conversation_history: conversationHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('partner_role', partnerRole);

  if (error) {
    console.error('Error updating session context:', error);
    return false;
  }

  return true;
};

export const updateScenarioInfo = async (
  sessionId: string,
  partnerRole: 'partner_a' | 'partner_b',
  scenarioInfo: { feeling: string; when_happened: string }
): Promise<boolean> => {
  const updates: any = {};

  if (partnerRole === 'partner_a') {
    updates.partner_a_feeling = scenarioInfo.feeling;
    updates.partner_a_when_happened = scenarioInfo.when_happened;
    updates.partner_a_scenario_completed = true;
  } else {
    updates.partner_b_feeling = scenarioInfo.feeling;
    updates.partner_b_when_happened = scenarioInfo.when_happened;
    updates.partner_b_scenario_completed = true;
  }

  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating scenario info:', error);
    return false;
  }

  return true;
};

export const updateChatStarted = async (
  sessionId: string,
  partnerRole: 'partner_a' | 'partner_b'
): Promise<boolean> => {
  const updates: any = {};

  if (partnerRole === 'partner_a') {
    updates.partner_a_chat_started = true;
  } else {
    updates.partner_b_chat_started = true;
  }

  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating chat started:', error);
    return false;
  }

  return true;
};

export const subscribeToMessages = (
  sessionId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToSession = (
  sessionId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
};
