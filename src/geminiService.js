import { SCHOOL_CONTEXT } from './schoolContext';

export async function sendMessage(history, userMessage, apiKey) {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const contents = [
    {
      role: 'user',
      parts: [{ text: SCHOOL_CONTEXT + '\n\nYou are now ready to help.' }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood! I am ready to assist students, parents, and visitors of PNHS-Main. How can I help you today?' }],
    },
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Failed to get response from Gemini.');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}