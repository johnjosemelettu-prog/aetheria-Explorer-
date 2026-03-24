
/**
 * @fileOverview Bridge flow for Linguistic Synthesis (TTS).
 * Communicates with the hosted Aetheria API node to perform auditory reconstruction.
 */

export async function textToSpeech(text: string): Promise<{ audioDataUri: string }> {
  const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:9003/api/ai';

  try {
    const response = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("API Node Offline");
    return await response.json();
  } catch (error) {
    console.warn("[AETHERIA BRIDGE] Auditory synthesis node unreachable. Returning silent node.");
    return { audioDataUri: '' };
  }
}
