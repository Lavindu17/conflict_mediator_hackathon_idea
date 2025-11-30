const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const sendMessageToGemini = async (history: any[], newMessage: string) => {
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  // Format history for Gemini API
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add the new message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const systemPrompt = `You are an empathetic conflict mediator. 
  You are talking to ONE partner in a relationship conflict. 
  Your goal: Listen, validate their feelings, and ask 1-2 clarifying questions. 
  DO NOT give advice yet. Just gather information and make them feel heard.
  Keep responses short (under 50 words).`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const generateFinalAdvice = async (partnerA_Text: string, partnerB_Text: string) => {
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `
  Analyze this conflict from two perspectives and provide separate advice.
  
  PARTNER A said: "${partnerA_Text}"
  PARTNER B said: "${partnerB_Text}"
  
  OUTPUT FORMAT (Strict JSON):
  {
    "advice_for_a": "Advice specifically for A...",
    "advice_for_b": "Advice specifically for B..."
  }
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  // Clean up code blocks if Gemini adds them
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
};