/**
 * groqExplanation.ts
 * Calls Groq API with automatic model fallback if one is overloaded.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

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

  for (const model of MODELS) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 200,
          temperature: 0.4,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || 'Unable to generate explanation.';
      }

      // 503 = overloaded, try next model
      if (response.status === 503) continue;

      // any other error — throw immediately
      const err = await response.text();
      throw new Error(`Groq API error ${response.status}: ${err}`);

    } catch (e) {
      if (model === MODELS[MODELS.length - 1]) throw e;
      continue;
    }
  }

  return 'All models busy — please try again in a moment.';
}
