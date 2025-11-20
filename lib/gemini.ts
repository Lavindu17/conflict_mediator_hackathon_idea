import { PartnerRole } from './supabase';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const SYSTEM_PROMPT = `You are CoupleBot Resolve, a specialized AI mediator for romantic partners in conflict. Your role is to:

1. Listen carefully to both partners privately and separately
2. Ask clarifying questions to understand each partner's perspective and feelings
3. Guide each partner to express their concerns using "I feel" statements and specific behaviors
4. Only provide advice once you have sufficient input from BOTH partners
5. Deliver personalized, actionable advice to each partner separately, focusing on what THEY can do to improve the situation

Key Guidelines:
- Be empathetic and non-judgmental
- Focus on behaviors, not character attacks
- Encourage specific, actionable changes
- Never share one partner's private messages with the other
- Ask follow-up questions if information is vague or unclear
- Wait for substantial input from both sides before offering advice
- Frame advice positively and constructively`;

const MEDIATION_PROMPT = `Based on the conversations with both partners, analyze the conflict and provide personalized advice to each partner.

Partner A's perspective:
{partner_a_context}

Partner B's perspective:
{partner_b_context}

Provide two separate responses:
1. ADVICE FOR PARTNER A: Specific, actionable steps Partner A can take
2. ADVICE FOR PARTNER B: Specific, actionable steps Partner B can take

Keep advice focused on self-improvement and constructive changes each person can make.`;

export const sendMessage = async (
  apiKey: string,
  conversationHistory: GeminiMessage[],
  userMessage: string
): Promise<{ response: string; updatedHistory: GeminiMessage[] }> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const newHistory = [
    ...conversationHistory,
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ];

  const requestBody = {
    contents: newHistory,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const botMessage = data.candidates[0].content.parts[0].text;

    const updatedHistory = [
      ...newHistory,
      {
        role: 'model' as const,
        parts: [{ text: botMessage }],
      },
    ];

    return { response: botMessage, updatedHistory };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

export const generateMediation = async (
  apiKey: string,
  partnerAContext: GeminiMessage[],
  partnerBContext: GeminiMessage[]
): Promise<{ adviceForA: string; adviceForB: string }> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const partnerAText = partnerAContext
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.parts[0].text)
    .join('\n');

  const partnerBText = partnerBContext
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.parts[0].text)
    .join('\n');

  const prompt = MEDIATION_PROMPT.replace('{partner_a_context}', partnerAText).replace(
    '{partner_b_context}',
    partnerBText
  );

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const fullResponse = data.candidates[0].content.parts[0].text;

    const adviceForAMatch = fullResponse.match(
      /ADVICE FOR PARTNER A:([\s\S]*?)(?=ADVICE FOR PARTNER B:|$)/i
    );
    const adviceForBMatch = fullResponse.match(/ADVICE FOR PARTNER B:([\s\S]*?)$/i);

    const adviceForA = adviceForAMatch
      ? adviceForAMatch[1].trim()
      : 'Please continue sharing your thoughts so I can provide better guidance.';
    const adviceForB = adviceForBMatch
      ? adviceForBMatch[1].trim()
      : 'Please continue sharing your thoughts so I can provide better guidance.';

    return { adviceForA, adviceForB };
  } catch (error) {
    console.error('Error generating mediation:', error);
    throw error;
  }
};

export const checkIfReadyForMediation = async (
  apiKey: string,
  partnerAContext: GeminiMessage[],
  partnerBContext: GeminiMessage[]
): Promise<boolean> => {
  const partnerAMessages = partnerAContext.filter((msg) => msg.role === 'user').length;
  const partnerBMessages = partnerBContext.filter((msg) => msg.role === 'user').length;

  if (partnerAMessages < 2 || partnerBMessages < 2) {
    return false;
  }

  const partnerAText = partnerAContext
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.parts[0].text)
    .join(' ');

  const partnerBText = partnerBContext
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.parts[0].text)
    .join(' ');

  const minLength = 50;
  return partnerAText.length >= minLength && partnerBText.length >= minLength;
};
