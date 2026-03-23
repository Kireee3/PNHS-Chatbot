import { retrieveRelevantChunks } from './knowledgeBase';

const BASE_SYSTEM = `You are a helpful, friendly, and knowledgeable assistant chatbot for Parañaque National High School – Main (PNHS-Main), also known as the "Gentle Warriors." You assist students, parents, and visitors with questions about the school.

Always be warm, professional, and concise. Respond in the same language the user uses — Filipino (Tagalog) or English.

OFFICIAL SOURCES — always cite these links when relevant:
- 🌐 Official Website: https://pnhsmain.depedparanaquecity.com
- 📘 Facebook Page: https://www.facebook.com/pnhsmain305424 (check pinned posts for latest announcements)
- 📖 Wikipedia: https://en.wikipedia.org/wiki/Para%C3%B1aque_National_High_School

RULES:
- Answer ONLY based on the provided context chunks below
- If a question is about current events, schedules, or announcements not found in the context, direct the user to the Facebook page
- Always include at least one relevant official link at the end of your response
- Keep responses concise and chat-friendly
- Use bullet points for lists
- End with an offer to help with more questions`;

export async function sendMessage(history, userMessage, apiKey) {
  const relevantChunks = retrieveRelevantChunks(userMessage, 3);

  const contextText = relevantChunks.length > 0
    ? `\n\n=== RELEVANT SCHOOL INFORMATION ===\n` +
      relevantChunks.map(c =>
        `[Source: ${c.source}]\n${c.content}`
      ).join('\n\n---\n\n')
    : `\n\nNo specific information found in the knowledge base. Direct the user to check the official Facebook page or website.`;

  const systemPrompt = BASE_SYSTEM + contextText;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt + '\n\nYou are now ready to help.' }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood! I am the PNHS-Main Assistant, ready to help students, parents, and visitors. How can I assist you today?' }],
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
        temperature: 0.5,
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