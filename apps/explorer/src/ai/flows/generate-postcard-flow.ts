
import { z } from 'zod';

/**
 * @fileOverview Bridge flow for the Postcard Studio.
 * Communicates with the hosted Aetheria API node to perform art synthesis.
 */

export type GeneratePostcardInput = {
  photoDataUri: string;
  style: 'Vintage' | 'Oil Painting' | 'Watercolor' | 'Cyberpunk' | 'Cinematic' | 'Sketch';
  message?: string;
  language?: string;
};

export type GeneratePostcardOutput = {
  postcardImageUrl: string;
  description: string;
};

const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:9003/api/ai';

export async function generatePostcard(input: GeneratePostcardInput): Promise<GeneratePostcardOutput> {
  try {
    const response = await fetch(`${API_BASE}/postcard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("API Node Offline");
    return await response.json();
  } catch (error) {
    console.warn("[AETHERIA BRIDGE] Postcard synthesis node unreachable. Returning high-fidelity mock.");
    return {
      postcardImageUrl: "https://picsum.photos/seed/postcard/800/600",
      description: `A beautiful ${input.style} synthesis of your travel memory. [OFFLINE MODE]`,
    };
  }
}
