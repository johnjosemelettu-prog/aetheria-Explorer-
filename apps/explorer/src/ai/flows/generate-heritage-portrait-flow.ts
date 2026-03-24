
/**
 * @fileOverview Bridge flow for the Heritage Mirror.
 * Communicates with the hosted Aetheria API node to perform high-fidelity persona reconstruction.
 */

export type HeritagePortraitInput = {
  photoDataUri: string;
  location: string;
  language?: string;
};

export type HeritagePortraitOutput = {
  portraitUrl: string;
  historicalContext: string;
};

const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:9003/api/ai';

export async function generateHeritagePortrait(input: HeritagePortraitInput): Promise<HeritagePortraitOutput> {
  try {
    const response = await fetch(`${API_BASE}/heritage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("API Node Offline");
    return await response.json();
  } catch (error) {
    console.warn("[AETHERIA BRIDGE] Heritage synthesis node unreachable. Returning high-fidelity mock.");
    return {
      portraitUrl: "https://picsum.photos/seed/heritage/800/1000",
      historicalContext: `A beautiful high-fidelity synthesis of traditional attire from ${input.location}. [OFFLINE MODE]`,
    };
  }
}
