/**
 * groqExplanation.ts
 * Calls Groq API to generate a plain-English explanation of a diagnosed condition.
 * Uses llama3-8b-8192 — fast, free-tier friendly.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export async function getGroqExplanation(
  condition: string,
  context: 'skin' | 'symptom'
): Promise<string> {
  const prompt =
    context === 'skin'
      ? `You are a clinical AI assistant. A CNN skin analysis model has detected: "${condition}".
In exactly 2–3 sentences: explain what this skin condition is, its most common causes, and one practical self-care tip.
Begin your response with exactly this phrase: "⚠️ I'm an AI assistant, not a doctor —" and then continue on the same line.
Be concise, clear, and avoid medical jargon.`
      : `You are a clinical AI assistant. A Bio_ClinicalBERT symptom classifier has predicted: "${condition}".
In exactly 2–3 sentences: explain what this condition typically involves, its key symptoms, and one immediate action the person should take.
Begin your response with exactly this phrase: "⚠️ I'm an AI assistant, not a doctor —" and then continue on the same line.
Be concise, clear, and avoid medical jargon.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Unable to generate explanation.';
}
